#!/usr/bin/env python3
"""Build ncm-at-twenty/index.html from page.src.html.

Citations are written in the template as [[key]] or [[key1,key2]]. This script
numbers sources in order of first appearance, renders each citation as a link
to the numbered source list, and fails if a key is unknown. It also reports
sources that are defined but never cited, so the list stays exactly the set of
sources the page relies on.

    python3 ncm-at-twenty/build.py
"""
import html
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent

# key: (description, url). Descriptions are in English; the note after each
# says what the page uses it for when that is not obvious from the title.
SOURCES = {
    # --- Leadership -------------------------------------------------------
    "mbz2011_en": ("Water is more important than oil for UAE: Mohammed bin Zayed (WAM). Emirates 24|7, 13 Dec 2011.",
                   "https://www.emirates247.com/news/government/water-is-more-important-than-oil-for-uae-mohammed-bin-zayed-2011-12-13-1.432657"),
    "mbz2011_ar": ("Mohamed bin Zayed: water is more important than oil for the UAE (Arabic, WAM). Emarat Al Youm, 14 Dec 2011.",
                   "https://www.emaratalyoum.com/local-section/other/2011-12-14-1.445015"),
    "iref2025_en": ("International Rain Enhancement Forum kicks off in Abu Dhabi, with H.H. Sheikh Mansour bin Zayed's speech. Abu Dhabi Media Office, 28 Jan 2025.",
                    "https://www.mediaoffice.abudhabi/en/environment/international-rain-enhancement-forum-kicks-off-in-abu-dhabi/"),
    "iref2025_ar": ("The same report in Arabic, with the original text of H.H.'s speech. Abu Dhabi Media Office, 28 Jan 2025.",
                    "https://www.mediaoffice.abudhabi/ar/environment/international-rain-enhancement-forum-kicks-off-in-abu-dhabi/"),
    "lexis": ("Federal Decree-Law No. 6 of 2007 on the establishment and organisation of the National Centre of Meteorology: preamble (Ministerial Decision No. 16 of 2007), Article 2, and amendments by Federal Law No. 13 of 2017 and Federal Law No. 2 of 2026. Lexis Middle East.",
              "https://www.lexismiddleeast.com/law/UnitedArabEmirates/DecreeLaw_6_2007/en"),
    "uaeleg": ("Federal Decree-Law No. 6 of 2007, issued 13 Nov 2007, full text (Arabic). UAE Legislation portal.",
               "https://uaelegislation.gov.ae/ar/legislations/1921"),
    "wam2004": ("New faces in UAE's cabinet reshuffle: Sheikh Mansour bin Zayed takes the Ministry of Presidential Affairs. WAM, 2 Nov 2004.",
                "https://www.wam.ae/en/article/hsyibcrr-new-faces-uae039s-cabinet-reshuffle"),
    "kt2008": ("Bylaws approved: Sheikh Mansour bin Zayed presides over the first meeting of the NCMS board of trustees (WAM). Khaleej Times, 23 Jun 2008.",
               "https://www.khaleejtimes.com/uae/bylaws-approved"),
    "wmo2015": ("US$5 million international research grant launched (UAEREP, under the patronage of H.H. Sheikh Mansour bin Zayed). World Meteorological Organization, 2015.",
                "https://wmo.int/media/magazine-article/us5-million-international-research-grant-launched"),
    "visit2025": ("Mansour bin Zayed visits National Centre of Meteorology; reviews key projects and advanced technologies. WAM, 4 Aug 2025.",
                  "https://www.wam.ae/en/article/bl0yv4l-mansour-bin-zayed-visits-national-centre"),
    "khaleej2026": ("Mansour bin Zayed: the rain enhancement research programme is a global platform for water security (Arabic). Al Khaleej, 13 May 2026.",
                    "https://www.alkhaleej.ae/2026-05-13/%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA/%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1-%D8%A7%D9%84%D8%AF%D8%A7%D8%B1/%D9%85%D9%86%D8%B5%D9%88%D8%B1-%D8%A8%D9%86-%D8%B2%D8%A7%D9%8A%D8%AF-%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA-%D9%84%D8%A8%D8%AD%D9%88%D8%AB-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%85%D8%B7%D8%A7%D8%B1-%D9%85%D9%86%D8%B5%D8%A9-%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-%D9%84%D8%AA%D8%B9%D8%B2%D9%8A%D8%B2-%D8%A7%D9%84%D8%A3%D9%85%D9%86-%D8%A7%D9%84%D9%85%D8%A7%D8%A6%D9%8A"),
    # --- For the nation ---------------------------------------------------
    "official": ("Partnership between NCM and Ras Al Khaimah International Airport: NCM as the only official provider of meteorological services (Arabic). WAM, 26 Nov 2024.",
                 "https://www.wam.ae/ar/article/b6e20kj-%D8%B4%D8%B1%D8%A7%D9%83%D8%A9-%D8%A8%D9%8A%D9%86-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A-%D9%84%D9%84%D8%A3%D8%B1%D8%B5%D8%A7%D8%AF-%D9%88%D9%85%D8%B7%D8%A7%D8%B1-%D8%B1%D8%A3%D8%B3-%D8%A7%D9%84%D8%AE%D9%8A%D9%85%D8%A9-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A"),
    "rain2024": ("UAE witnesses its heaviest rainfall since data collection began in 1949. WAM, 16 Apr 2024.",
                 "https://www.wam.ae/en/article/13vbuq9-uae-witnesses-largest-rainfall-over-past-years"),
    "warn2024": ("NCM: atmospheric instability to increase from Monday afternoon until Wednesday morning (Arabic). WAM, 14 Apr 2024.",
                 "https://www.wam.ae/ar/article/b2ni20j-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A-%D9%84%D9%84%D8%A3%D8%B1%D8%B5%D8%A7%D8%AF-%D8%AD%D8%A7%D9%84%D8%A9-%D8%B9%D8%AF%D9%85-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%82%D8%B1%D8%A7%D8%B1-%D8%A7%D9%84%D8%AC%D9%88%D9%8A-%D8%AA%D8%B2%D8%AF%D8%A7%D8%AF"),
    "red2024": ("Red alert issued by Met Office as more rain clouds form over the UAE. Gulf News, 16 Apr 2024.",
                "https://gulfnews.com/uae/weather/red-alert-issued-by-met-office-as-more-rain-clouds-form-over-the-uae-1.1713281623276"),
    "ews2024": ("MoFA and NCM launch the Early Warning System for All digital platform. UAE Ministry of Foreign Affairs, 30 Aug 2024.",
                "https://www.mofa.gov.ae/en/mediahub/news/2024/8/30/30-8-2024-uae-mofa"),
    "faq": ("Frequently asked questions: UAE annual rainfall below 100 mm. UAE Research Program for Rain Enhancement Science.",
            "https://www.uaerep.ae/section/outreach/resources/faq?locale=en&nID=2035"),
    "missions": ("UAE to carry out hundreds of cloud-seeding missions in 2024: an NCM official on nearly 300 missions a year. Al Arabiya English, 18 Jan 2024.",
                 "https://english.alarabiya.net/News/gulf/2024/01/18/UAE-to-carry-out-hundreds-of-cloud-seeding-missions-in-2024-to-tackle-water-scarcity"),
    "wss2036": ("The UAE Water Security Strategy 2036. UAE Government portal.",
                "https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/strategies-plans-and-visions/environment-and-energy/the-uae-water-security-strategy-2036"),
    "hpc": ("UAE's National Center for Meteorology advances weather forecasting with new supercomputer built by HPE. HPCwire, Oct 2021.",
            "https://www.hpcwire.com/off-the-wire/uaes-ncm-advances-weather-forecasting-with-new-supercomputer-built-by-hpe/"),
    "ai2026": ("NCM launches agentic AI assistants for weather services. WAM, 29 Jun 2026.",
               "https://www.wam.ae/en/article/c0ywq23-ncm-launches-countrys-first-agentic-assistants-for"),
    "factory": ("Rains in UAE: inside the factory that makes salt flares for cloud-seeding. Khaleej Times.",
                "https://www.khaleejtimes.com/uae/weather/rains-in-uae-inside-the-factory-that-makes-salt-flares-for-cloud-seeding"),
    "wmo2023": ("UAE wins presidency of the World Meteorological Organization. UAE Ministry of Foreign Affairs, 2 Jun 2023.",
                "https://www.mofa.gov.ae/en/mediahub/news/2023/6/2/2-6-2023-uae-wins"),
    "rtc": ("New WMO Regional Training Centre in the United Arab Emirates. WMO MeteoWorld, Nov 2024.",
            "https://wmo.int/resources/meteoworld/meteoworld-november-2024/new-wmo-regional-training-centre-united-arab-emirates"),
    # --- Rain -------------------------------------------------------------
    "zawya": ("Seeds in the clouds: a timeline of the UAE's rain enhancement journey since 1982. Zawya, 18 Jan 2018.",
              "https://www.zawya.com/en/business/seeds-in-the-clouds-a-timeline-of-uaes-rain-enhancement-journey-since-1982-432923"),
    "hosari": ("T. Al Hosari et al., The UAE cloud seeding program: a statistical and physical evaluation. Atmosphere 12, 1013 (MDPI), Aug 2021.",
               "https://doi.org/10.3390/atmos12081013"),
    "gain": ("UAE conducts 172 cloud-seeding flights in 2025 so far (NCM: 10 to 25 percent more rainfall). Gulf News, 10 Aug 2025.",
             "https://gulfnews.com/uae/weather/uae-conducts-172-cloud-seeding-flights-in-2025-so-far-1.500228558"),
    "npj": ("NCM and UAEREP scientists on rain enhancement in the UAE (cost per cubic metre). npj Climate and Atmospheric Science, 26 Oct 2023.",
            "https://www.nature.com/articles/s41612-023-00503-2"),
    "cycle6": ("UAE Research Program for Rain Enhancement Science announces its sixth-cycle awardees. WAM, 21 Jan 2026.",
               "https://www.wam.ae/en/article/byc8t48-uae-research-programme-for-rain-enhancement"),
    "cnn": ("Scientists are zapping clouds with electricity to make it rain. CNN, 27 May 2021.",
            "https://www.cnn.com/2021/05/27/middleeast/clouds-electricity-rain-spc-intl"),
    "cycle5": ("Three research projects win the programme's fifth-cycle grants (Arabic). UAE Research Program for Rain Enhancement Science, Jan 2024.",
               "https://www.uaerep.ae/ar/media-press/734/20"),
    "awmc": ("A. Al Mazrouei, Cloud seeding in the United Arab Emirates (programme figures to cycle 5). Asian Weather Modification Conference, 2024.",
             "https://awmc.royalrain.go.th/awmc2024/img/UAE_Cloud%20Seeding%20in%20the%20United%20Arab%20Emirates.pdf"),
    "patents": ("Outcomes and impact (patents). UAE Research Program for Rain Enhancement Science.",
                "https://www.uaerep.ae/section/innovation/outcomes-and-impact?locale=en&nID=2062"),
    "kaz2025": ("Memorandum between Kazhydromet, Kazaeronavigatsia and the UAE National Center of Meteorology. Kazhydromet, Oct 2025.",
                "https://www.kazhydromet.kz/en/post/3090"),
    "kaz2026": ("President of Kazakhstan meets WMO President; UAE rain-enhancement pilot in Turkistan region. WAM, 15 May 2026.",
                "https://www.wam.ae/en/article/c084839-president-kazakhstan-meets-with-wmo-president"),
    "morocco": ("Morocco, UAE to boost forecasting and cloud-seeding innovation cooperation. Barlaman Today, 4 Dec 2025.",
                "https://barlamantoday.com/2025/12/04/morocco-uae-to-boost-forecasting-and-cloud-seeding-innovation-cooperation/"),
    "lahore": ("Artificial rain over Lahore with UAE aircraft (AFP). Dawn, Dec 2023.",
               "https://www.dawn.com/news/1798419"),
    "unwater": ("2026 UN Water Conference: revised dates, 8 to 10 December 2026, Abu Dhabi. UN-Water, 25 May 2026.",
                "https://www.unwater.org/news/2026-un-water-conference-revised-dates"),
    # --- Journey ----------------------------------------------------------
    "durour_szgmc": ("Al Droor wa Al Tawali: the Durour calendar and star risings. Sheikh Zayed Grand Mosque Centre.",
                     "https://szgmc.gov.ae/en/publications/al-droor-wa-al-tawali"),
    "durour_nat": ("Al Durour, the ancient Gulf calendar used to predict weather and grow crops. The National, 30 Sep 2021.",
                   "https://www.thenationalnews.com/uae/2021/09/30/al-durour-the-ancient-gulf-calendar-used-to-predict-wild-weather-and-grow-crops/"),
    "majid_rak": ("Ahmed bin Majid. Ras Al Khaimah Department of Antiquities and Museums.",
                  "https://rakheritage.rak.ae/ahmed-bin-majid/"),
    "majid_loc": ("Kitab al-Fawa'id fi usul 'ilm al-bahr wa al-qawa'id, assembled in 1490. Library of Congress.",
                  "https://www.loc.gov/item/2008401696/"),
    "majid_beaujard": ("P. Beaujard, The Worlds of the Indian Ocean (on Ibn Majid's sailing seasons and star altitudes). Cambridge University Press, 2019.",
                       "https://doi.org/10.1017/9781108341004.002"),
    "pearl": ("Pearl diving: heritage register. Abu Dhabi Department of Culture and Tourism.",
              "https://abudhabiculture.ae/en/cultural-heritage/intangible/heritage-register/traditional-handicraft/pearl-diving"),
    "winds": ("Almehrezi, doctoral thesis on the maritime heritage of the UAE (local wind names). University of Plymouth, 2017.",
              "https://doi.org/10.24382/1078"),
    "unesco": ("Cultural Sites of Al Ain (Hafit, Hili, Bidaa Bint Saud and Oases Areas). UNESCO World Heritage Centre.",
               "https://whc.unesco.org/en/list/1343/"),
    "zayed_aflaj": ("Sheikh Zayed bin Sultan Al Nahyan: biography (restoration of the aflaj in Al Ain). Embassy of the UAE, Washington DC.",
                    "https://www.uae-embassy.org/sheikh-zayed-bin-sultan-al-nahyan"),
    "zayed_en": ("Sheikh Zayed's message for the first UAE Environment Day, 1998. UAE Ministry of Foreign Affairs.",
                 "https://www.mofa.gov.ae/en/MediaHub/News/2019/2014/5/3/030514-abo-dhabi"),
    "zayed_ar": ("Sheikh Zayed, a model of care for the environment (Arabic). Aletihad, 2012.",
                 "https://www.aletihad.ae/article/76781/2012/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE-%D8%B2%D8%A7%D9%8A%D8%AF-%D9%86%D9%85%D9%88%D8%B0%D8%AC-%D9%85%D8%AA%D9%85%D9%8A%D8%B2-%D9%81%D9%8A-%D8%A7%D9%84%D8%A7%D9%87%D8%AA%D9%85%D8%A7%D9%85-%D8%A8%D8%A7%D9%84%D8%A8%D9%8A%D8%A6%D8%A9-%D9%88%D8%A7%D9%84%D8%AB%D8%B1%D9%88%D8%A7%D8%AA-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A%D8%B9%D9%8A%D8%A9"),
    "mahatta": ("Sharjah's winged history (Al Mahatta and the first weather forecasting centre). Gulf News, 4 Oct 2012.",
                "https://gulfnews.com/uae/sharjahs-winged-history-1.1085522"),
    "wmo1986": ("Convention of the World Meteorological Organization: status of parties (UAE accession 17 Dec 1986). US Department of State, treaty depositary.",
                "https://2009-2017.state.gov/documents/organization/201721.pdf"),
    "seismic": ("NCM seismologists on the UAE national seismic network, established August 2008 (conference abstract). IUGG General Assembly, 2023.",
                "https://doi.org/10.57757/iugg23-3012"),
    "rename2017": ("Khalifa issues decree amending the name of NCMS. UAE Cabinet, 18 Oct 2017.",
                   "https://uaecabinet.ae/en/news/khalifa-issues-decree-amending-the-name-of-ncms"),
    "wmoprofile": ("Abdulla Al Mandous, President of WMO. World Meteorological Organization.",
                   "https://wmo.int/profile/abdulla-al-mandous"),
    "cop28": ("Science for Climate Action Pavilion programme: WMO, IPCC, MERI Foundation and NCM. World Meteorological Organization, Dec 2023.",
              "https://wmo.int/files/wmo-ipcc-meri-ncm-science-climate-action-pavilion-programme"),
    "ew4all": ("Early Warnings for All. World Meteorological Organization.",
               "https://wmo.int/all-activities/build-resilience/early-warnings-all"),
}

CITE = re.compile(r"\[\[([a-z0-9_,\s]+)\]\]")


def build() -> int:
    src = (HERE / "page.src.html").read_text(encoding="utf-8")
    order: dict[str, int] = {}

    def number(key: str) -> int:
        if key not in SOURCES:
            raise KeyError(f"unknown source key: {key}")
        if key not in order:
            order[key] = len(order) + 1
        return order[key]

    def render(match: re.Match) -> str:
        keys = [k.strip() for k in match.group(1).split(",") if k.strip()]
        links = ", ".join(
            f'<a href="#s-{number(k)}" aria-label="Source {number(k)}">{number(k)}</a>' for k in keys
        )
        return f'<sup class="cite" dir="ltr">{links}</sup>'

    try:
        body = CITE.sub(render, src)
    except KeyError as err:
        print(f"build failed: {err}", file=sys.stderr)
        return 1

    items = []
    for key, n in sorted(order.items(), key=lambda kv: kv[1]):
        text, url = SOURCES[key]
        host = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]
        items.append(
            f'      <li id="s-{n}">{html.escape(text)} '
            f'<a href="{html.escape(url)}" rel="noopener">{html.escape(host)}</a></li>'
        )
    body = body.replace("{{SOURCES}}", "\n".join(items))

    unused = sorted(set(SOURCES) - set(order))
    if unused:
        print("note: sources defined but not cited:", ", ".join(unused), file=sys.stderr)

    (HERE / "index.html").write_text(body, encoding="utf-8")
    print(f"wrote index.html: {len(order)} sources cited, {len(body):,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(build())
