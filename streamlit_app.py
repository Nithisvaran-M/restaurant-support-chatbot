import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(page_title="CyberBot Pro", layout="wide")

# This script finds your built React app and shows it inside Streamlit
# To make this work on Streamlit Cloud, you MUST upload the 'dist' folder to GitHub

path_to_html = os.path.join("dist", "index.html")

if os.path.exists(path_to_html):
    with open(path_to_html, 'r', encoding='utf-8') as f:
        html_data = f.read()
    
    # Injecting the full high-end React UI
    components.html(html_data, height=1200, scrolling=True)
else:
    st.error("Build not found.")
    st.info("To get the High-End Interface, please deploy this repository on VERCEL instead of Streamlit.")
    st.markdown("""
    ### How to get the Best Interface:
    1. Upload this project to **GitHub**.
    2. Go to **Vercel.com**.
    3. Import the repo and click **Deploy**.
    """)
