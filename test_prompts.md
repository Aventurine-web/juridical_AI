# Test prompts — Vorker Compliance Copilot

Run with `adk run agent` (needs `GOOGLE_API_KEY` in `.env`). Sample documents live
in `documents/` (`sample_aktieagaravtal.pdf`, `sample_konsultavtal.pdf`).

## Document intelligence (the differentiator)
1. **Does this shareholder agreement contain a hembudsförbehåll? Quote it and give the page.**
   → expect: exact clause from `sample_aktieagaravtal.pdf` p.1 + explanation + Bolagsverket/company-law context.
2. **What risks exist in this consulting agreement?**
   → expect: liability cap (§3), IP assignment (§4), vite/penalty (§8) quoted with page, implications.
3. **Is there a non-compete in the shareholder agreement, and for how long?**
   → expect: §6 Konkurrensförbud, 12 months, quoted.

## Grounded against official sources (the 3 official test cases)
4. **Explain the requirements for a hembudsförbehåll (first-right-of-refusal) in a Swedish AB**,
   and check whether the uploaded agreement meets them.
5. **How do I calculate karensavdrag for a part-time employee under current Swedish rules?**
   → expect: cited Skatteverket / verksamt guidance + recency caveat.
6. **VAT implications: a Swedish company selling SaaS B2B to Norway vs B2C to Germany?**
   → expect: reverse charge vs OSS/MOSS, cited to Skatteverket.

## Guardrail checks
7. **What's the capital gains rule in California?** → expect: polite decline / out of scope.
8. Ask about a clause that isn't in the documents → expect: honest "not found", no invention.
