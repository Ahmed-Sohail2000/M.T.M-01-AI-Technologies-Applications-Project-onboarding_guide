import openai
from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_chain import build_llm_chain, format_chunks_with_metadata
from app.services.rag_service import RAGService
from prompts.builder import build_simple_prompt
from prompts.postprocess import strip_scratchpad

router = APIRouter(prefix="/api/v1/chat")


@router.post("/")
async def chat_endpoint(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    q = request.question
    dept = current_user.get("dept")

    try:
        # 1. Retrieve relevant chunks from ChromaDB, filtered to the user's department.
        rag = RAGService()
        retriever = rag.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 4,
                **({
                    "filter": {"department": dept}
                } if dept else {}),
            },
        )
        docs = await retriever.ainvoke(q)

        # 2. Format retrieved docs into a citation-rich context string.
        ctx = format_chunks_with_metadata(docs)

        # 3. Invoke the LLM chain with the fully-resolved input dict.
        prompt = build_simple_prompt() if request.simple_mode else None
        llm_chain = build_llm_chain(prompt)
        raw = await llm_chain.ainvoke({
            "question": q,
            "context": ctx,
            "user_department": dept or "General",
            "user_role": current_user.get("role", "USER"),
            "company_name": "VaultMind Demo Corp",
            "fallback_contact": "your team lead or HR",
        })
    except openai.AuthenticationError:
        return ChatResponse(
            answer="NVIDIA NIM returned 401 Unauthorized. Check NVIDIA_API_KEY in rag_backend/.env."
        )
    except openai.APIStatusError as exc:
        return ChatResponse(
            answer=(
                f"LLM request failed with status {exc.status_code}. "
                "Verify NVIDIA NIM is running and NVIDIA_CHAT_MODEL is correct."
            )
        )
    except openai.APIConnectionError:
        return ChatResponse(
            answer=(
                "NVIDIA NIM and LM Studio are both unreachable. "
                "Ensure your NIM container is running (or set NVIDIA_BASE_URL to the DGX Spark endpoint)."
            )
        )

    # 4. Strip CoT scratchpad blocks before returning to the client.
    public_answer = strip_scratchpad(raw)
    return ChatResponse(answer=public_answer)
