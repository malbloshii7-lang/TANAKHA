"""Curated meteorology-sector sources for the NCM International Affairs feed.

Each source is a plain RSS/Atom URL plus display metadata. Edit this list to
add or remove feeds — nothing else needs to change. `category` drives the
filter chips in the interface; `tier` lets the UI emphasise authoritative
bodies (WMO/UN) over general media.
"""

SOURCES = [
    # --- Tier 1: authoritative / institutional ---
    {
        "id": "wmo",
        "name": "WMO",
        "full_name": "World Meteorological Organization",
        "url": "https://wmo.int/rss.xml",
        "category": "Governance",
        "tier": 1,
    },
    {
        "id": "unfccc",
        "name": "UNFCCC",
        "full_name": "UN Climate Change",
        "url": "https://unfccc.int/news/rss.xml",
        "category": "Governance",
        "tier": 1,
    },
    {
        "id": "ipcc",
        "name": "IPCC",
        "full_name": "Intergovernmental Panel on Climate Change",
        "url": "https://www.ipcc.ch/feed/",
        "category": "Science",
        "tier": 1,
    },
    {
        "id": "ecmwf",
        "name": "ECMWF",
        "full_name": "European Centre for Medium-Range Weather Forecasts",
        "url": "https://www.ecmwf.int/en/about/media-centre/news/rss.xml",
        "category": "Operations",
        "tier": 1,
    },
    {
        "id": "noaa",
        "name": "NOAA",
        "full_name": "US National Oceanic and Atmospheric Administration",
        "url": "https://www.noaa.gov/feeds/news.xml",
        "category": "Operations",
        "tier": 1,
    },
    {
        "id": "metoffice",
        "name": "Met Office",
        "full_name": "UK Met Office",
        "url": "https://www.metoffice.gov.uk/about-us/news-rss",
        "category": "Operations",
        "tier": 1,
    },
    {
        "id": "copernicus",
        "name": "Copernicus",
        "full_name": "Copernicus Climate Change Service",
        "url": "https://climate.copernicus.eu/rss.xml",
        "category": "Climate",
        "tier": 1,
    },
    # --- Tier 2: trusted media / analysis ---
    {
        "id": "carbonbrief",
        "name": "Carbon Brief",
        "full_name": "Carbon Brief",
        "url": "https://www.carbonbrief.org/feed/",
        "category": "Climate",
        "tier": 2,
    },
    {
        "id": "wmo_water",
        "name": "WMO Hydrology",
        "full_name": "WMO Water & Cryosphere",
        "url": "https://community.wmo.int/en/rss/water.xml",
        "category": "Water",
        "tier": 2,
    },
]

CATEGORIES = ["Governance", "Operations", "Science", "Climate", "Water"]
