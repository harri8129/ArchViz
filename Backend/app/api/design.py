from fastapi import APIRouter, HTTPException
from app.schemas.design import DesignRequest
from app.llm.client import call_llm

router = APIRouter()

def load_prompt(system_name: str) -> str:
    with open("app/llm/prompts/system.txt", "r") as f:
        prompt = f.read()
    return prompt.replace("{{SYSTEM_NAME}}", system_name)

@router.post("/generate")
async def generate_design(payload: DesignRequest):
    try:
        prompt = load_prompt(payload.system_name)
        llm_response = await call_llm(prompt)

        content = llm_response["choices"][0]["message"]["content"]

        return {
            "system": payload.system_name,
            "raw_output": content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
