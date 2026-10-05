from typing import Protocol


class NarrativeProvider(Protocol):
    def summarize(self, overview: dict, findings: list[dict]) -> str: ...


class LocalNarrativeProvider:
    """Default offline narrative. A future provider can consume the same grounded findings."""
    def summarize(self, overview: dict, findings: list[dict]) -> str:
        text = (f"{overview['rows']:,} records, {overview['columns']} fields: "
                f"{overview['numeric']} numeric metrics, {overview['categorical']} categorical dimensions "
                f"and {overview['datetime']} time {'dimension' if overview['datetime'] == 1 else 'dimensions'}.")
        if overview.get("date_range"):
            text += f" Coverage: {overview['date_range'][0][:10]} to {overview['date_range'][1][:10]}."
        return text + " Findings use rule-based statistical analysis; no AI API or causal inference."
