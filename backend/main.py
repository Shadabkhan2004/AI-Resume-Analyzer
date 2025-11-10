from fastapi import FastAPI,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os,tempfile


from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel,Field
from langchain.schema.runnable import RunnableLambda
from typing import Optional

from utils import get_docs,clean_text,chunk_documents

load_dotenv()

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

OPENAI_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING = OpenAIEmbeddings(model=EMBEDDING_MODEL)

VECTOR_DIR = os.path.join(tempfile.gettempdir(),"vector_store")
LATEST_VECTOR_STORE: str | None = None


def init_vector_store(docs):
  vector_dir = os.path.join(tempfile.gettempdir(),f"vector_store_{uuid.uuid4()}")

  vector_store = Chroma.from_documents(documents=docs,embedding=EMBEDDING,persist_directory=vector_dir)
  vector_store.persist()

  return vector_store,vector_dir


def combine_docs(docs):
  return "\n\n".join(d.page_content for d in docs)


class CandidateProfile(BaseModel):
    name: str = ""
    contact: Optional[str] = ""
    summary: Optional[str] = ""
    education: list[str] = []
    experience: list[str] = []
    certifications: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    tools: list[str] = []
    soft_skills: list[str] = []
    other_skills: list[str] = []


llm = ChatOpenAI(model=OPENAI_MODEL)


parser = JsonOutputParser(pydantic_object=CandidateProfile)


prompt = PromptTemplate(
    template = """
    You are a precise resume parser.

    Extract **all relevant information** from the following resume context:
    - Full name
    - Contact info (email or phone)
    - Professional summary or objective
    - Education (degree, institution, year)
    - Work experience (company, role, duration, achievements)
    - Certifications
    - Technical skills (programming languages, frameworks, tools)
    - Soft skills

    Use the schema below to structure the output strictly as JSON:
    {format_instructions}

    Resume:
    {context}

    Return only valid JSON. Leave missing fields empty.
    """,
    input_variables=["context"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
  
  if not file.filename.lower().endswith((".pdf", ".docx", ".txt")):
    return {"error": "Unsupported file type"}
  
  global LATEST_VECTOR_STORE
  file_path = os.path.join(tempfile.gettempdir(), file.filename)

  with open(file_path,"wb") as f:
    f.write(await file.read())
  
  docs = get_docs(file_path)
  docs = [Document(page_content=clean_text(d.page_content),metadata=d.metadata) for d in docs]
  chunks = chunk_documents(docs)

  vector_store,vector_id = init_vector_store(chunks)
  LATEST_VECTOR_STORE = vector_id

  try:
    os.remove(file_path)
  except OSError:
    pass

  return {"message":f"PDF Uploaded"}


class QuestionRequest(BaseModel):
  query: str


@app.post("/ask-question/")
async def ask_question(request: QuestionRequest):
  query = request.query

  if not LATEST_VECTOR_STORE or not os.path.exists(LATEST_VECTOR_STORE):
    return {"error": "No PDF uploaded yet."}
  
  vector_store = Chroma(persist_directory=LATEST_VECTOR_STORE,embedding_function=EMBEDDING)

  retriever = vector_store.as_retriever(search_kwargs={"k":6})

  chain = (
      {"context": retriever | RunnableLambda(combine_docs)}
      | prompt
      | llm
      | parser
  )


  answer = chain.invoke(query)

  return answer.dict() if hasattr(answer, "dict") else answer
