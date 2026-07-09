import datetime
import random
import uuid

from ..normalize import is_breaking, parse_engagement_score
from .base import EventSource, FeedSource

# Zero-key offline generator. Mirrors the design prototype's SAMPLE_FEED /
# INCOMING_POSTS content but runs server-side with real timestamps instead of
# a client setTimeout loop, so it's a genuine (if synthetic) live source that
# works with no API keys. Swap in RssFeedSource / TwitterFeedSource for real
# data once credentials/feeds are available.

_SEED_POOL = [
    {"author": "Prof. Celeste Saulo", "handle": "@CelesteSaulo", "avatar": "CS",
     "source": "WMO", "platform": "twitter", "role": "WMO Secretary-General",
     "text": "Just concluded productive meetings with regional NHMS directors in Geneva. Strengthening early warning systems remains our top priority.",
     "engagement": "1.8k reposts · 4.2k likes", "hasImage": False},
    {"author": "WMO", "handle": "@WMO", "avatar": "W",
     "source": "WMO", "platform": "twitter", "role": "Official",
     "text": "Global mean temperature this month was 1.4°C above the 1850-1900 average. The latest State of the Climate update highlights accelerating trends.",
     "engagement": "2.4k reposts · 5.1k likes", "hasImage": True, "imageLabel": "global temp anomaly chart"},
    {"author": "Dr. Ko Barrett", "handle": "@WMO_DSG", "avatar": "KB",
     "source": "WMO", "platform": "linkedin", "role": "WMO Deputy Secretary-General",
     "text": "Impressed by the progress of SOFF-supported countries strengthening their observational networks. Improved surface weather stations are now feeding the global basic observing network.",
     "engagement": "560 reactions", "hasImage": False},
    {"author": "WMO Regional Office Africa", "handle": "@WMO_Africa", "avatar": "WA",
     "source": "WMO", "platform": "twitter", "role": "Regional Office",
     "text": "The African Ministerial Conference on Meteorology reaffirms commitment to multi-hazard early warning systems across the continent.",
     "engagement": "380 reposts · 890 likes", "hasImage": True, "imageLabel": "AMCOMET conference photo"},
    {"author": "WMO Regional Office Europe", "handle": "@WMO_Europe", "avatar": "WE",
     "source": "WMO", "platform": "twitter", "role": "Regional Office",
     "text": "European heatwave protocol activated in coordination with EUMETNET members. Warning: coordinated impact-based warnings now issuing across member states.",
     "engagement": "440 reposts · 980 likes", "hasImage": False},
    {"author": "Kenya Met Dept", "handle": "@KenyaMetDept", "avatar": "KE",
     "source": "NHMS", "platform": "twitter", "role": "Kenya",
     "text": "Heavy rainfall warning for western Kenya: 50-80mm expected over the next 48 hours. Communities in flood-prone areas should take precautionary measures.",
     "engagement": "412 reposts · 1.1k likes", "hasImage": False},
    {"author": "SAWS South Africa", "handle": "@SAWeatherServic", "avatar": "ZA",
     "source": "NHMS", "platform": "twitter", "role": "South Africa",
     "text": "Cold front approaching the Western Cape. Heavy rainfall and strong winds for coastal areas. Level 4 warning issued.",
     "engagement": "680 reposts · 1.5k likes", "hasImage": True, "imageLabel": "synoptic chart"},
    {"author": "JMA Japan", "handle": "@JMA_kishou", "avatar": "JP",
     "source": "NHMS", "platform": "twitter", "role": "Japan",
     "text": "Typhoon has intensified to Category 3 equivalent in the western Pacific. Highest alert level issued for the southern Ryukyu Islands.",
     "engagement": "2.1k reposts · 4.8k likes", "hasImage": True, "imageLabel": "typhoon track forecast"},
    {"author": "BMKG Indonesia", "handle": "@infoBMKG", "avatar": "ID",
     "source": "NHMS", "platform": "twitter", "role": "Indonesia",
     "text": "M5.8 earthquake detected off northern Sulawesi. No tsunami warning issued. All seismic monitoring stations operational.",
     "engagement": "3.4k reposts · 6.1k likes", "hasImage": False},
    {"author": "NOAA", "handle": "@NOAA", "avatar": "US",
     "source": "NHMS", "platform": "facebook", "role": "United States",
     "text": "Atlantic hurricane season update: sea surface temperatures in the main development region remain above average, keeping an above-normal season outlook in place.",
     "engagement": "4.2k shares · 8.1k reactions", "hasImage": True, "imageLabel": "SST anomaly chart"},
    {"author": "NWS", "handle": "@NWS", "avatar": "US",
     "source": "NHMS", "platform": "twitter", "role": "United States",
     "text": "Excessive heat warning for the Phoenix metro area through Friday. Cooling centers open across the county. Check on vulnerable neighbors.",
     "engagement": "2.8k reposts · 5.4k likes", "hasImage": False},
    {"author": "ECCC Canada", "handle": "@ECCCWeather", "avatar": "CA",
     "source": "NHMS", "platform": "twitter", "role": "Canada",
     "text": "Wildfire smoke advisory for Alberta and Saskatchewan. Air quality at very high risk in Edmonton and Saskatoon — limit outdoor activities.",
     "engagement": "1.9k reposts · 3.6k likes", "hasImage": True, "imageLabel": "smoke forecast map"},
    {"author": "Met Office UK", "handle": "@metoffice", "avatar": "UK",
     "source": "NHMS", "platform": "twitter", "role": "United Kingdom",
     "text": "Yellow warning for thunderstorms across SE England tomorrow. Some flooding of transport routes likely.",
     "engagement": "1.3k reposts · 2.8k likes", "hasImage": True, "imageLabel": "UK warning map"},
    {"author": "Meteo-France", "handle": "@MeteoFrance", "avatar": "FR",
     "source": "NHMS", "platform": "instagram", "role": "France",
     "text": "Canicule: vigilance orange pour 15 departements du sud de la France ce week-end. Pensez a vous hydrater regulierement.",
     "engagement": "6.2k likes", "hasImage": True, "imageLabel": "heat map France"},
    {"author": "PAGASA Philippines", "handle": "@dost_pagasa", "avatar": "PH",
     "source": "NHMS", "platform": "twitter", "role": "Philippines",
     "text": "Tropical depression has formed east of Mindanao. Signal No. 1 raised over Eastern Visayas. Public advised to monitor updates.",
     "engagement": "1.8k reposts · 3.5k likes", "hasImage": True, "imageLabel": "tropical cyclone bulletin"},
    {"author": "UNEP", "handle": "@UNEP", "avatar": "UN",
     "source": "UN", "platform": "twitter", "role": "UN Environment Programme",
     "text": "New report: climate finance flows reached record levels last year — still far short of what's needed annually. We must close the gap, especially for adaptation.",
     "engagement": "3.8k reposts · 7.2k likes", "hasImage": True, "imageLabel": "finance data visualization"},
    {"author": "UNFCCC", "handle": "@UNFCCC", "avatar": "UN",
     "source": "UN", "platform": "facebook", "role": "Climate Convention",
     "text": "Registration is now open for the next intersessional meetings. Parties are invited to submit updated NDCs reflecting enhanced ambition.",
     "engagement": "2.1k shares · 4.3k reactions", "hasImage": True, "imageLabel": "event banner"},
    {"author": "WHO", "handle": "@WHO", "avatar": "UN",
     "source": "UN", "platform": "twitter", "role": "World Health Organization",
     "text": "Heat-health alert: joint advisory issued for South Asia. Hospitals reporting a surge in heat-related illness. Early warning systems are saving lives.",
     "engagement": "2.6k reposts · 5.8k likes", "hasImage": False},
    {"author": "WFP", "handle": "@WFP", "avatar": "UN",
     "source": "UN", "platform": "twitter", "role": "World Food Programme",
     "text": "Anticipatory action triggered ahead of forecast flooding. Families received cash transfers 72 hours before the water rose. This is early warning in action.",
     "engagement": "1.8k reposts · 4.2k likes", "hasImage": True, "imageLabel": "anticipatory action map"},
    {"author": "UNDRR", "handle": "@UNDRR", "avatar": "UN",
     "source": "UN", "platform": "twitter", "role": "Disaster Risk Reduction",
     "text": "Mid-term review: most countries have now integrated climate risk into national disaster-reduction strategies. Multi-hazard early warning coverage continues to climb.",
     "engagement": "780 reposts · 1.8k likes", "hasImage": False},
    {"author": "IPCC", "handle": "@IPCC_CH", "avatar": "IP",
     "source": "Climate", "platform": "twitter", "role": "Intergovernmental Panel on CC",
     "text": "Work on the next Synthesis Report is well underway. The scientific community continues to provide the evidence base for informed climate action.",
     "engagement": "2.9k reposts · 6.5k likes", "hasImage": False},
    {"author": "Copernicus Climate", "handle": "@CopernicusECMWF", "avatar": "C3",
     "source": "Climate", "platform": "twitter", "role": "EU Climate Service",
     "text": "Monthly bulletin: this month ranks among the warmest on record globally. Mediterranean and Arctic anomalies most pronounced.",
     "engagement": "2.2k reposts · 4.8k likes", "hasImage": True, "imageLabel": "temp anomaly map"},
    {"author": "NASA Climate", "handle": "@NASAClimate", "avatar": "NA",
     "source": "Climate", "platform": "twitter", "role": "NASA",
     "text": "Satellite data shows accelerating ice mass loss from the Greenland Ice Sheet. The Antarctic ice sheet is also losing mass, primarily from West Antarctica.",
     "engagement": "4.1k reposts · 9.2k likes", "hasImage": True, "imageLabel": "ice mass chart"},
    {"author": "Carbon Brief", "handle": "@CarbonBrief", "avatar": "CB",
     "source": "Climate", "platform": "twitter", "role": "Climate Media",
     "text": "Analysis: global CO2 emissions from fossil fuels rose slightly this quarter year-on-year, with renewables offsetting some coal demand growth.",
     "engagement": "1.8k reposts · 4.0k likes", "hasImage": True, "imageLabel": "emissions trend chart"},
    {"author": "Green Climate Fund", "handle": "@GCF", "avatar": "GC",
     "source": "Finance", "platform": "linkedin", "role": "GCF",
     "text": "Board approves new funding for climate projects across Africa and SIDS. Focus areas: renewable energy access, resilient agriculture, and coastal protection.",
     "engagement": "1.2k reactions", "hasImage": True, "imageLabel": "project map"},
    {"author": "World Bank Climate", "handle": "@WBG_Climate", "avatar": "WB",
     "source": "Finance", "platform": "linkedin", "role": "World Bank Group",
     "text": "Announcing a new facility for climate adaptation in Sub-Saharan Africa, focusing on drought-resilient agriculture and water resource management.",
     "engagement": "980 reactions", "hasImage": False},
    {"author": "GEF", "handle": "@theGEF", "avatar": "GE",
     "source": "Finance", "platform": "twitter", "role": "Global Environment Facility",
     "text": "Replenishment negotiations conclude with new pledges from donor countries. The climate change focal area receives the largest allocation.",
     "engagement": "680 reposts · 1.5k likes", "hasImage": True, "imageLabel": "replenishment chart"},
    {"author": "SOFF", "handle": "@SOFF_fund", "avatar": "SO",
     "source": "Finance", "platform": "twitter", "role": "Systematic Observations Financing Facility",
     "text": "Milestone: dozens of countries now receiving support to close critical weather observation gaps in LDCs and SIDS. Data saves lives.",
     "engagement": "380 reposts · 890 likes", "hasImage": False},
    {"author": "AfDB Climate", "handle": "@AfDB_Group", "avatar": "AD",
     "source": "Finance", "platform": "linkedin", "role": "African Development Bank",
     "text": "Africa Climate Fund disbursements climb again this year. Adaptation projects now represent the majority of the portfolio.",
     "engagement": "560 reactions", "hasImage": True, "imageLabel": "climate portfolio"},
]

_EVENT_POOL = [
    {"title": "WMO Executive Council Session", "location": "Geneva, Switzerland"},
    {"title": "AMCOMET Bureau Meeting", "location": "Addis Ababa, Ethiopia"},
    {"title": "World Meteorological Day Webinar", "location": "Virtual"},
    {"title": "IPCC Working Group Scoping Session", "location": "Nairobi, Kenya"},
    {"title": "UNFCCC SBI/SBSTA Intersessional", "location": "Bonn, Germany"},
    {"title": "GCF Readiness Programme Review", "location": "Songdo, South Korea"},
    {"title": "GCF Board Meeting", "location": "Songdo, South Korea"},
    {"title": "SOFF Steering Committee", "location": "Geneva, Switzerland"},
    {"title": "IPCC Lead Authors Meeting", "location": "Cape Town, South Africa"},
    {"title": "WMO Commission for Weather", "location": "Geneva, Switzerland"},
    {"title": "Early Warnings for All — Steering Group", "location": "Geneva, Switzerland"},
    {"title": "GCF Private Sector Advisory Group", "location": "Songdo, South Korea"},
]


def _score(pool_item: dict) -> int:
    return parse_engagement_score(pool_item.get("engagement"))


class MockFeedSource(FeedSource):
    name = "mock"
    # Mirrors the prototype's simulated 7-13s cadence between new posts.
    min_delay, max_delay = 7.0, 13.0

    def __init__(self) -> None:
        self._idx = 0

    def next_delay(self) -> float:
        return random.uniform(self.min_delay, self.max_delay)

    async def seed(self) -> list[dict]:
        now = datetime.datetime.now(datetime.timezone.utc)
        items = []
        for i, base in enumerate(_SEED_POOL):
            ts = now - datetime.timedelta(minutes=i * 7 + random.randint(0, 4))
            items.append(self._build(base, ts, f"seed-{i}"))
        return items

    async def poll(self) -> list[dict]:
        base = _SEED_POOL[self._idx % len(_SEED_POOL)]
        self._idx += 1
        now = datetime.datetime.now(datetime.timezone.utc)
        return [self._build(base, now, f"live-{uuid.uuid4().hex[:12]}")]

    @staticmethod
    def _build(base: dict, ts: datetime.datetime, external_id: str) -> dict:
        item = dict(base)
        item["id"] = f"mock-{external_id}"
        item["timestamp"] = ts.isoformat(timespec="seconds") + "Z" if ts.tzinfo is None else ts.isoformat()
        item.setdefault("hasImage", False)
        item["engagement_score"] = _score(base)
        item["isBreaking"] = is_breaking(item["text"])
        return item


class MockEventSource(EventSource):
    name = "mock"
    min_delay, max_delay = 18.0, 28.0

    def __init__(self) -> None:
        self._idx = 0

    def next_delay(self) -> float:
        return random.uniform(self.min_delay, self.max_delay)

    async def seed(self) -> list[dict]:
        today = datetime.date.today()
        items = []
        day_cursor = today
        for i, base in enumerate(_EVENT_POOL[:10]):
            day_cursor = day_cursor + datetime.timedelta(days=random.randint(2, 5))
            items.append(self._build(base, day_cursor, f"seed-{i}"))
        return items

    async def poll(self) -> list[dict]:
        base = _EVENT_POOL[self._idx % len(_EVENT_POOL)]
        self._idx += 1
        future = datetime.date.today() + datetime.timedelta(days=random.randint(30, 60))
        return [self._build(base, future, f"live-{uuid.uuid4().hex[:12]}")]

    @staticmethod
    def _build(base: dict, day: datetime.date, external_id: str) -> dict:
        return {
            "id": f"mock-event-{external_id}",
            "date": day.isoformat(),
            "day": f"{day.day:02d}",
            "month": day.strftime("%b"),
            "title": base["title"],
            "location": base["location"],
        }
