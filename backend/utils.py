from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
import re
import fitz


def get_docs(file_path):
  docs = []
  pdf = fitz.open(file_path)
  for i,page in enumerate(pdf):
    text = page.get_text()
    if text.strip():
      docs.append(Document(page_content=text,metadata={"page":i+1,"source":file_path}))
  
  return docs


def clean_text(text):
  return " ".join(text.split())


def chunk_documents(docs):
  text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=600,
    chunk_overlap=120,
    separators=["\n\n","\n"," ",""]
  )
  chunks = text_splitter.split_documents(docs)
  return chunks