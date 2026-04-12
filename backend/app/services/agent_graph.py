"""Assembles the LangGraph reasoning graph and exposes run_agent().

The compiled graph is a module-level singleton — it is built once
when this module is first imported, not on every call.
"""

import logging

from langgraph.graph import StateGraph, END

from app.services.agent_state import AgentState, initial_state
from app.services.agent_nodes import (
    retrieve_node,
    analyze_node,
    verify_node,
    decide_node,
    respond_node,
    should_continue,
)

logger = logging.getLogger(__name__)


def build_agent_graph():
    """Builds and compiles the LangGraph agent."""
    graph = StateGraph(AgentState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("analyze", analyze_node)
    graph.add_node("verify", verify_node)
    graph.add_node("decide", decide_node)
    graph.add_node("respond", respond_node)

    graph.set_entry_point("retrieve")

    graph.add_edge("retrieve", "analyze")
    graph.add_edge("analyze", "verify")
    graph.add_edge("verify", "decide")

    graph.add_conditional_edges(
        "decide",
        should_continue,
        {
            "analyze": "analyze",
            "respond": "respond",
        },
    )

    graph.add_edge("respond", END)

    return graph.compile()


# Module-level singleton — compiled once on import.
agent = build_agent_graph()


def run_agent(query: str, repo_id: str) -> dict:
    """
    Runs the full CodeRAG reasoning agent.

    Returns the final_response dict on success, or an error dict on failure.
    """
    state = initial_state(query, repo_id)
    try:
        result = agent.invoke(state)
        if result.get("error"):
            return {"error": result["error"], "final_response": None}
        return result["final_response"]
    except Exception as e:
        logger.error(f"Agent run failed: {e}")
        return {
            "error": str(e),
            "root_cause": None,
            "suggested_fix": None,
            "evidence": [],
            "confidence": 0.0,
            "iterations": 0,
        }
