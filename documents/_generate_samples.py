"""Generate realistic Swedish sample documents for the Compliance Copilot demo.

Run once:  python documents/_generate_samples.py
Produces multi-page PDFs so the agent's "exact quote + page number" feature is
visible. These are FICTITIOUS samples for demonstration only.
"""
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent


class Doc(FPDF):
    def header(self) -> None:
        pass

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120)
        self.cell(0, 10, f"Sida {self.page_no()} (av {{nb}})", align="C")


def build(filename: str, title: str, blocks: list[tuple[str, str]]) -> None:
    pdf = Doc()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(0, 9, title)
    pdf.ln(4)
    for heading, body in blocks:
        if heading:
            pdf.set_font("Helvetica", "B", 12)
            pdf.multi_cell(0, 7, heading)
            pdf.ln(1)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, body)
        pdf.ln(3)
    pdf.output(str(OUT / filename))
    print("wrote", filename)


# ---------------------------------------------------------------- Shareholders' agreement
build(
    "sample_aktieagaravtal.pdf",
    "AKTIEAGARAVTAL",
    [
        (
            "Mellan parterna",
            "Detta aktieagaravtal (\"Avtalet\") har traffats mellan Anna Lindqvist "
            "(556701-XXXX andel), Bjorn Sandberg och Cecilia Ek (gemensamt "
            "\"Aktieagarna\") avseende deras aktieinnehav i Nordklang Teknik AB, "
            "org.nr 559123-4567 (\"Bolaget\").",
        ),
        (
            "1. Bakgrund och syfte",
            "Aktieagarna ager samtliga aktier i Bolaget. Syftet med Avtalet ar att "
            "reglera parternas inbordes forhallande som aktieagare, styrningen av "
            "Bolaget samt overlatelse av aktier.",
        ),
        (
            "2. Aktieinnehav",
            "Vid Avtalets ingaende fordelar sig aktierna enligt foljande: Anna "
            "Lindqvist 50 procent, Bjorn Sandberg 30 procent och Cecilia Ek 20 "
            "procent. Samtliga aktier har lika rost.",
        ),
        (
            "3. Styrelse och beslut",
            "Styrelsen ska besta av tre ledamoter. Beslut av sarskild betydelse, "
            "sasom upptagande av lan over 500 000 kronor eller anstallning av "
            "verkstallande direktor, kraver enhallighet bland Aktieagarna.",
        ),
        (
            "4. Hembudsforbehall (forkopsratt)",
            "Onskar en Aktieagare overlata sina aktier till tredje man ska aktierna "
            "forst hembjudas till ovriga Aktieagare. Den overlatande Aktieagaren ska "
            "skriftligen underratta styrelsen, som inom sju (7) dagar ska meddela "
            "ovriga Aktieagare. Ovriga Aktieagare har darefter ratt att inom trettio "
            "(30) dagar losa de hembjudna aktierna i forhallande till sitt tidigare "
            "innehav. Loseskillingen ska motsvara det pris och de villkor som "
            "erbjudits av tredje man, eller vid oenighet det varde som faststalls "
            "enligt punkt 5. Utnyttjas inte hembudsratten inom fristen far aktierna "
            "overlatas till tredje man pa de villkor som angetts i hembudet.",
        ),
        (
            "5. Vardering",
            "Kan parterna inte enas om aktiernas varde ska detta faststallas av en "
            "oberoende auktoriserad revisor utsedd av Bolagets revisor. Varderingen "
            "ska baseras pa bolagets justerade egna kapital samt en skalig "
            "avkastningsvardering.",
        ),
        (
            "6. Konkurrensforbud",
            "Aktieagare far inte under innehavstiden, och under tolv (12) manader "
            "darefter, bedriva verksamhet som konkurrerar med Bolaget.",
        ),
        (
            "7. Sekretess",
            "Aktieagarna forbinder sig att inte for utomstaende roja konfidentiell "
            "information om Bolaget.",
        ),
        (
            "8. Tillampligt lag och tvist",
            "Pa Avtalet ska svensk ratt tillampas. Tvist ska avgoras av allman "
            "domstol med Stockholms tingsratt som forsta instans.",
        ),
        (
            "Underskrifter",
            "Detta Avtal har upprattats i tre exemplar. Ort och datum: Stockholm, "
            "den 14 mars 2026. Anna Lindqvist / Bjorn Sandberg / Cecilia Ek.",
        ),
    ],
)

# ---------------------------------------------------------------- Consulting agreement
build(
    "sample_konsultavtal.pdf",
    "KONSULTAVTAL",
    [
        (
            "Parter",
            "Detta konsultavtal har traffats mellan Nordklang Teknik AB (\"Bestallaren\") "
            "och Frilans Sven Persson, F-skattsedel innehas (\"Konsulten\").",
        ),
        (
            "1. Uppdraget",
            "Konsulten ska utfora utvecklingstjanster enligt bilaga 1. Uppdraget "
            "utfors pa konsultbasis och innebar inte anstallning.",
        ),
        (
            "2. Ersattning och betalning",
            "Ersattning utgar med 950 kronor per timme exklusive moms. Fakturering "
            "sker manadsvis med betalningsvillkor trettio (30) dagar. Vid forsenad "
            "betalning utgar drojsmalsranta enligt rantelagen.",
        ),
        (
            "3. Ansvarsbegransning",
            "Bestallarens sammanlagda skadestandsansvar under detta avtal ar "
            "begransat till ett belopp motsvarande den ersattning som Konsulten "
            "fakturerat under de senaste tre (3) manaderna. Ingen part ansvarar for "
            "indirekt skada eller utebliven vinst.",
        ),
        (
            "4. Immateriella rattigheter",
            "Samtliga resultat och immateriella rattigheter som uppkommer inom "
            "ramen for uppdraget overlats till Bestallaren i sin helhet. Konsulten "
            "behaller dock ratt till generell kunskap och metodik.",
        ),
        (
            "5. Sekretess",
            "Konsulten far inte for utomstaende roja information om Bestallarens "
            "verksamhet. Sekretessen galler aven efter avtalets upphorande.",
        ),
        (
            "6. Konkurrens- och varvningsforbud",
            "Konsulten far inte under avtalstiden och tolv (12) manader darefter "
            "varva Bestallarens anstallda eller kunder.",
        ),
        (
            "7. Uppsagning",
            "Avtalet kan sagas upp av bada parter med en (1) manads "
            "uppsagningstid. Bestallaren har ratt att hava avtalet med omedelbar "
            "verkan vid vasentligt avtalsbrott.",
        ),
        (
            "8. Skadestand",
            "Vid brott mot sekretess- eller konkurrensbestammelserna utgar ett "
            "vite om 100 000 kronor per overtradelse, utan att Bestallarens ratt "
            "till ytterligare skadestand inskranks.",
        ),
        (
            "9. Tillampligt lag och tvist",
            "Pa avtalet tillampas svensk ratt. Tvist ska slutligt avgoras genom "
            "skiljeforfarande enligt Stockholms Handelskammares regler.",
        ),
        (
            "Underskrifter",
            "Stockholm den 2 april 2026. Nordklang Teknik AB / Sven Persson.",
        ),
    ],
)
