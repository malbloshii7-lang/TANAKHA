'use strict';
// Revision 11 · Fujairah, the east coast: VLCC Jetty No. 1 of the Port of Fujairah at the seaward end of the northern
// breakwater, a very large crude carrier alongside on the loading platform's arms, the Hajar close behind in clear
// morning light (mid-March, about 8:30: the sun at azimuth 106 deg, 28 deg up, over the sea behind the eye's right
// shoulder). True 3D (engrave3d.js): metres, x east, y north, z up from the sea, the origin on the berthing line at the
// platform's centre (about 25.1910 N, 56.3831 E). The eye is at sea south-south-east of the berth (see view()).
// The berth, from the port's own documents:
//   where: the as-built general mooring arrangement (Royal HaskoningDHV for the Port of Fujairah, contractors Six Construct
//     and Rotary Engineering, drawing 3-2014-N2288-SDD-01DW3-0010-AB of 14 April 2016, WGS-84 UTM 40N, the berth within
//     about E 437 650-438 050, N 2 786 000-2 786 500) and the beacon positions in the port's Notice to Mariners 148
//     (MD1 25 11.358 N 56 22.986 E, MD6 25 11.557 N 56 22.956 E). The moored ship's axis is 352/172 deg true, parallel to
//     the breakwater (NTM 206, 2 June 2016); the basin is dredged to -26 m CD; LOA 240-344 m, up to 330 000 DWT.
//   what (the drawing): one loading platform; four breasting dolphins with one fender each (NTM 148: fender centrelines
//     132.3 m apart for the outer pair, 83.3 m for the inner); six mooring dolphins, their centres over the berth's 380 m
//     at 40, 40, 42.5, 24.5, 86, 24.5, 42.5, 40, 40 m; walkways W1-W12 on two walkway supports; the access trestle (about
//     120 m) to its abutment on the breakwater; two boat landings; navigation beacon masts on MD1, BD1, BD4 and MD6.
//   levels: the jetty deck +9.6 m CD (NTM 148), the dolphins about +8 m; the sea is drawn at +1.4 m CD (mid-tide).
//   the platform: four 16-inch marine loading arms, at most 18.5 m above the jetty top (NTM 148), flanges 4 m apart, each
//     a riser, a counterweighted inboard arm and an outboard arm down to the ship's manifold; an operator's cabin, a
//     gangway tower, two fire-monitor towers (parked, dry); the two 40-inch lines to Matrix Manifold 2 run back along the
//     trestle (Port of Fujairah) and are not followed ashore.
//   moorings (NTM 148): twenty quick-release hooks; 4 head, 4 breast and 2 spring lines forward, 4 stern, 4 breast and
//     2 spring lines aft: the head and stern lines to the outer mooring dolphins, the breasts to the inner ones, the
//     springs short to the platform.
//   the breakwater (Gulf Foundation; MUC Engineering): a 2.9-3 km rubble mound, rock core and heavy rock armour, a mass
//     concrete crown wall on its crest, the causeway to the berth. Its arm runs parallel to the berth; it turns due west
//     for the shore about 330 m north of the berth's centre, its trunk passing the port's directional light (NTM 148,
//     25 11.622 N 56 22.706 E); 630 m of arm and 2.3 km of trunk. The frame cuts the trunk before its root.
// The ship: a generic VLCC, 330 m by 60 m, 30.5 m deep, partly laden at the berth (16.5 m draught, 14 m of hull showing,
// the band of her bottom paint below her load line in a lighter tone), her manifold amidships; bow SOUTH (away from the
// strait), starboard side to the berth. Plain: no name, flag, funnel colours, logo or livery, and no funnel smoke.
// The Hajar: the true skyline and the ranges in front of it, computed from terrain tiles from the eye's own position
// (JT_RIDGES: AWS Terrain Tiles z12, SRTM-derived; standard refraction; ground outside the UAE ignored, as
// data/build/rak_skyline.py and lab/ridges.py), each range lighter with its distance and hatched where its slopes turn
// from the sun; the shore and the foot of the hills from the same tiles. Nothing ashore is drawn: no tank farm, terminal,
// pipe rack or manifold (the coastal strip stays a bare, far band); no single-point mooring, no other ship, no craft, no
// buoy. Clear air: no smoke, haze plume, flare, glow, fire or backlight anywhere.
// The inset: NCM's east-coast marine bulletin, drafting itself line by line (the AI assistant prepares the draft), then
// signed (a forecaster approves it); no numbers. Its chart is the UAE's east coast from the film's map data
// (data/uae-map.json arcs 43, 25, 23, 39, 45, north to south, as scenes/plate-tanker.js), with the sea to the east.
// JT_RIDGES: the ranges seen from 25.1827 N 56.3874 E, 100 m up (the camera's mid-beat place, x 430, y -924), bearings
// 320-347 deg every 0.06 deg; bands out to 5, 6.5, 8, 10, 12.5, 15.5, 19, 24 and 40 km. Each point 6 base-64 characters
// (distance/10, height+200, the sun on the crest, the sun on the band's visible slopes, 0-63); each bearing 4 more for
// the shore and the hills' foot (the first ground 25 m up), distance/10.
const JT_RIDGES = {"c0":[430,-924],"az0":320.0,"daz":0.06,"n":9,"shore":"GkJ/GkJ/GkJ/GnJ/GnJ/GnJ/GnKCGnKCGnKCGnKCGqKCGqKCGqKCGqKCGqKCGqKFGqKFGqKFGqKFGtKFGtKIGtKIGtKIGtKIGtKIGwKIGwKIG/KLG/KLG/KLG8KLG8KLG8KLG8KLG8KLG8KLG/KLG/KLG/KLG/KLG/KLG/KLHCKLHCKLHCKLHCKLHCKLHFKLHFKLHFKLHFKLHFKLHIKOHIKOHIKOHIKRHLKRHjKRHjKUHXKXHXKXHXKXHXKXHXKaHUKaHUKaHUKaHUKaHUKdHUKdHUKdHUKdHUKgHULiHXMzHXMzHXMzHXMzHXMwHaMwHaKpHaKmHdKmHdKmHmKmHmKmHmKmHmKmHmKmHmKmHmKmHmKmHmKpHmKpHmMtHmM/HmM/HpM/HpM/HpM2HsM2HsM2HsM2HsM2HvMzHvMzHvMzHvMwHvMwHyMwHyMwITMwITMzITMzITMzITMzIQMzIQM2IQM2IQM2IQM2IQM2IQM2IQM5IQM5IQM5IBM5IBM8ITM8IWM5IWM5IWM5IWM2IZMzIZMwIZMtIZMqIWMqIWMqITMkITMkIQMkIQMhIQMhINMhINMhIHMhIHMhIHMeIHMeIHMeIHMeIHMeIKMeIKMeIKMeIKMeINMeINMeINMeINMeIQMeIQMeIQMeITMbITMYITMYIWMYIWMYIZMYIZMYIZMVIZMVIZMVIcMVIcMVIcMVIfMSIfMSIfMSIiMPIiMPIiMPIlMMIlMMIlMGIlMDIlMDIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMAIlMDIoMDIoMGIoMkIoMkIoMkIoMkIoMkIrMkIuMkIuMkIxMnIxMnI0MnI0MqI0MqI0M8I0M/I3M/I3M/I3M/I3M/I3NCI3NCI3NFI3NUI3NUI3NUI6NUI6NUI6NXI6NXI6NXI6NXI9NaI9NaI9NaI9NaI9NaJANaJANaJANaJDNaJDNaJDNaJGNaJGNaJGNaJJNaJJNaJMNaJMNaJPNaJPNaJPNaJSNdJSQOJVQOJVQOJYQLJYLoJbLlJeLlJeLlJhLiJhLiJhLiJkLiJkLiJkLiJkLiJnLiJnLfJnLfJqLfJqLfJqLfJqLfJqLfJtLfJtLfJtLfJtLiJtLiJwLiJwLlJwLoJwLuJwLxJzL0JzL0JzL0JzL0JzL3J2L3J2L3J2L3J2L3J5L3J5L6J5L6J5L6J5L6J8L6J8L6J8L6J8L6J8L9J8L9J8L9J8L9J/MAJ/P2J/P2J/P5J/P5J/P5J/P5KCP5KCP5KpP2KpP2KpP2KpPzKsPzKsPzKsPzKsPzKsPzKvPzKvPzKvPzKvPzKvPzKyP2KyP2KyP2KyP2KyP5KyP5KyP8KyQvK1Q7K1Q7K1Q7K1Q7K1Q+K4Q7K4Q7K7Q7K+Q+LBQ+LERNLHRNLKRNLKRKLNRNLQRELQRBLTRBLWRBLZQ+LcQ+LfQ+LiQ+LiQ+LlQ+LlQ+LoQ+LrQ+LrQ4LuQ4LuQ1LxQ1MDQ4MDQ4MDRNMDRQMGRQMGRfMnRfMnRfMPRfMMRiMMRiMMRiMMRiMMR6MMR9MJR9MJR9MJSAMJSAMJRZMJRWMJRZMJSDMJS2MMS2MMS5MMTUMMTUMMTXMPTXMPTXMSTXMSTXMnTyMnTyMqTyMqTyMtT1MtXTMtSYMtSYMtSYMtSYMtWsMtWsMwTXMwTUMwTUMzTUMzTRM2TOM5TLM8TIM/TINCTFNFTFNFTFNITFNLTFNOTFNUTFNmTFNmTINmV8NmV8NmV8NmV8NjV8NjV8NgV/NjOENjV/NjV8NjV8NjV8","pts":"HvDKdeKIERzmMeFTvtMzGspuMzGsppMzGsppMzGsppjBP9djjBP9ddHvDLeeKIEQzlMeFUutMwGmpuMwGmppMwGmppMwGmppjWQPLjjWQPLLHvDLeeKIEOzlMeFUutMwGkotMwGkooMwGkooMwGkoojWQcOgjWQcOOHvDMeeKIENzlMeFVttMwGhmsMwGhmmMwGhmmMwGhmmjWQlQijWQlQQHyDLbdKIEMzjMeFVttMtGeosMtGeooMtGeooMtGeoojWQrUhjWQrUUHyDMceKIELzjMeFWssMtGbmsMtGbmmMtGbmmMtGbmmjTQqfgjTQqffHyDMceKIEJzjMeFYssMtGZlrMtGZllMtGZllMtGZlljTQrkgjTQrkkHyDMceKIEHzjMeFZrsMqGXorMqGXooMqGXooMqGXoojQQlqijQQlqqHyDMceKIEGzjMeFarsMqGWnrMqGWnnMqGWnnMqGWnnjTQXmhjTQXmmHyDMceKIEEzjMeFbrsMqGUmqMqGUmmMqGUmmMqGUmmhnPngehnPnggHvDMfeKIECzkMeFdrrOTGghoOTGghhOTGghhOTGghhhkPkmihkPkmmHvDMgfKIEAzkMeFeqrOTGglnOTGgllOTGgllOTGgllhbPdhlhbPdhhHvDMgfKID+0jMeFgqrOTGfnnOTGfnnOTGfnnOTGfnnhYPZlihYPZllHyDLceKID70jMeFiprMqGQfnMqGQffMqGQffMqGQffhJPRXihJPRXXHyDLceKID50jMeFkqrOWGcknOWGckkOWGckkOWGckkhJPThhhJPThhHyDLceKID20jMeFmqqMnGOkoMnGOkkMnGOkkMnGOkkhJPOlghJPOllHyDLceKID00kMeFopqMnGOjnMnGOjjMnGOjjMnGOjjg6PSRfg6PSRRHyDLceKIDx0kMeFqppMnGPinMnGPiiMnGPiiMnGPiig3PYSdg3PYSSHyDKceKIDvzkMeFspoMnGPimMnGPiiMnGPiiMnGPiig0PdSbg0PdSSHyDJceKIDszkMeFupoMnGOimMnGOiiMnGOiiMnGOiigxPjTcgxPjTTHyDJceKIDqzkMeFvpmMnGOhnMnGOhhMnGOhhMnGOhhguPqUgguPqUUHyDJceKIDoykMeFyqlMnGNgmMnGNggMnGNggMnGNggguPxWiguPxWWHvDJfeKIDmyjMeF1qkMnGNkoMnGNkkMnGNkkMnGNkkguP3XkguP3XXHvDJffKIDkxiMeFyrjMnGOjoMnGOjjMnGOjjMnGOjjguP6ZmguP6ZZHvDIffKIDixiMeF0siMnGMjoMnGMjjMnGMjjMnGMjjgrP4gogrP4ggHvDIffKIDgwhMeF1tiMnGIjpMnGIjjMnGIjjMnGIjjgrP0gogrP0ggHvDIefKIDfwhMeF0uiMnGFkpMnGFkkMnGFkkMnGFkkgoPxhpgoPxhhHvDIefKIDdvhMeFzujMkGErtMkGErrMkGErrMkGErrglPwnsglPwnnHyDHbgKIDcuhMeFyvjMkGEstMkGEssMkGEssMkGEssglPykrglPykkHyDHbgKIDbugMeFwwkMnF/mrMnF/mmMnF/mmMnF/mmglPuhpglPuhhHvDIegKIDatgMeFuxkMnF+nsMnF+nnMnF+nnMnF+nnglPscmglPsccHvDIdgKIDZsgMeFrylMqF1fpMqF1ffMqF1ffMqF1ffglPtZkglPtZZHvDJdgKIDYsgMeFnwmMqFzgqMqFzggMqFzggMqFzgggiPvlpgiPvllHvDJdgKIDYrfMeFjxmMqFxhqMqFxhhMqFxhhMqFxhhgiPxpsgiPxppHvDKdfKIDZrfMeFeynMnFrquMnFrqqMnFrqqMnFrqqgiPvtwgiPvttHvDKdfKIDZqgMeFayoMnFnrtQOF4qqQOF4qqQOF4qqgiPtx1giPtxxHvDKdfKIDZqfMeFVyoN4FvYnN4FvYYN4FvYYN4FvYYglPolzglPollHvDLdfKIDaqfMeFPynN4FyXnN4FyXXN4FyXXN4FyXXglPin0glPinnHvDLceKIDapfMeFJynN7F3LjN7F3LLN7F3LLN7F3LLglPdq0glPdqqHvDLceKIDapfMeFEyoN7F6LjN7F6LLN7F6LLN7F6LLglPTs0glPTssHyDKbdKIDapfMeE+xnN7F9LjN7F9LLN7F9LLN7F9LLglPLt0glPLttHyDLbeKIDapfMeE5xoN7GBLjN7GBLLN7GBLLN7GBLLglPCszglPCssHyDLbeKIDapfMeEzxoN7GDLkN7GDLLN7GDLLN7GDLLglO2ryglO2rrHyDLbeKIDZpfMeEuxpN7GFLkN7GFLLN7GFLLN7GFLLglOupzglOuppHyDMbeKIDZpfMeEpwpN4GHWmN4GHWWN4GHWWN4GHWWglOlm1glOlmmHyDMbeKIDZpfMeEkwoN4GKWmN4GKWWN4GKWWN4GKWWglOei0glOeiiHyDMbeKIDZofMeEfwpN4GOVlN4GOVVN4GOVVN4GOVVglOaexglOaeeHyDMbeKIDZofMeEbwqN4GQVlN4GQVVN4GQVVN4GQVVglOWavglOWaaHyDNbeKIDZofMeEYvqN4GUVlN4GUVVN4GUVVN4GUVVgiOVqugiOVqqHyDNcfKIDZofMeEUvrN4GXWlN4GXWWN4GXWWN4GXWWgiOUntgiOUnnHyDNceKIDYogMeEQuqN4GaWlN4GaWWN4GaWWN4GaWWgiOWlsgiOWllHyDOceKIDYogMeENuoN4GdXlN4GdXXN4GdXXN4GdXXgiOXmrgiOXmmHyDOceKIDYngMeEJuoN4GfYlN4GfYYN4GfYYN4GfYYgiOXmqgiOXmmHyDOceKIDXngMeEFtoN4GgamN4GgaaN4GgaaN4GgaagiOYoqgiOYooHyDOdeKIDXngMeEBtnN4GgcnN4GgccN4GgccN4GgccgiOSougiOSooHyDOdeKIDXnfMeD+snN4GedoN4GeddN4GeddN4GeddgiONpxgiONppHyDOdeKIDWnfMeD7snN1GeoqN1GeooN1GeooN1GeoogiOIpwgiOIppHyDOdfKIDWmfMeD4rnN1GbprN1GbppN1GbppN1GbppgiOEpxgiOEppHyDOdfKIDVmgMeD0rmN1GXqsN1GXqqN1GXqqN1GXqqgiOCmwgiOCmmHyDOdfKIDUmgMeDxrmN1GTrtN1GTrrN1GTrrN1GTrrgiN+lvgiN+llHyDOdfKIDTlgMeDuqmN1GPsuN1GPssN1GPssN1GPssgiN5ivgiN5iiHyDOefKIDSlfMeDrqmN1GMruN1GMrrN1GMrrN1GMrrgiN3eugiN3eeHyDNeeKIDRkfMeDopmN1GHsuN1GHssN1GHssdrKWttgfNymtgfNymmHyDNefKIDRkfMeDmpmN1GBsuN1GBssN1GBssdlKVgggfN2irgfN2iiHyDNeeKIDQjfMeDkomN1F7ruQFGKttQFGKttdfKboogfN2gqgfN2ggHyDMeeKIDPjfMeDiomN1F2rtQFGJuuQFGJuudfKUmsgfN1gqgfN1ggHvDNfeKIDPieMeDgnlN1FxqrQFGIvvQFGIvvdfKOkugfNzhrgfNzhhHvDNfeKIDPieMeDemlN1FsqrQFGIwwQFGIwwdcKFswgcNsutgcNsuuHvDMfeKIDOheMeDdmjN1FnqqQFGHxxQFGHxxdcJ+rwgfNlltgfNlllHvDMffKIDOhfMeDcljN1FippQFGFxxQFGFxxdcJwqxgfNenugfNennHvDMffKIDOgeMeDbkiN1FeppQFGCyyQFGCyydrJvzzgiNbcugiNbccHvDLffKIDOgeMeDajiN1FaooQCFvyyQCFvyydrJvyygiNehwgiNehhHvDLffKIDPgeMSDafiN1FWooQCFuzyQCFuzzdrJuywglNeVwglNeVVHvDLefKIDPfeMSDafhN1FTonQCFtzyQCFtzzdrJrytglNdbxglNdbbHvDKefKIDPfeMSDZfhN1FQnnQCFrzyQCFrzzdrJoxvglNdhwglNdhhHvDKefKIDPfeMSDZfgN1FNnnQCFpzzQCFpzzdrJmwtglNbnxglNbnnHvDKefKIDPgeMSDZegNyFKrnQCFmzyQCFmzzdrJhvngoNccxgoNcccHvDKefKIDPgeL9DbdgNyFGqnQCFjzzQCFjzzdrJbusgoNdjygoNdjjHvDJefKIDPgeL9DcdgNyFDqmQCFf0zQCFf00drJTtqgrNfVxgrNfVVHvDJefKIDPgeL9DcdfNyE/qnQCFazzQCFazzdrJItlgrNjdxgrNjddHsDJffKIDPgeL9DcdfNyE7qnQCFUzyQCFUzzcII4AAgrNnkygrNnkkHsDJeeKIDPgeL9DbdfNyE3qnQCFOyyQCFOyycCJmAAguNoXwguNoXXHsDJeeKIDOgeL3DbdgNyEyqnP/FCxxP/FCxxcCJsAAguNndxguNnddHsDJeeKIDOgfL3DcegNyEtqmP/E+wvP/E+wwcCJyCCguNnhyguNnhhHsDIeeKIDNgfL3DcegNvEpvmP/E6uuP/E6uub/J8PPguNfkxguNfkkHsDIeeKIDNgfMeDXegNvEkumP/E3ttP/E3ttb/KBPPguNWlvguNWllHsDIeeKIDNgeMeDYegNvEftmP/E0rsP/E0rrb/KISSguNLlsguNLllHsDIeeKIDMfeMeDYegNvEatmP/ExqqP/Exqqb/KQTTgrNAsrgrNAssHsDHeeKIDMfeMeDYegNsEYvlP/EvopP/Evoob/KXXXgrM6pqgrM6ppHpDIffKIDMfeMeDYefNvERslP/EunpP/Eunnb/KecigoM0qsgoM0qqHpDIffKIDMfeMeDYegNvEQrlP/EsnoP/EsnncCKkUhgoMwqugoMwqqHpDIffKIDMeeMeDZegPnEBgkP8ErmnP8ErmmcCKoamgoMnpvgoMnppHpDIffKIDNeeMeDZegPnEBgjP8ErmmP8ErmmcCKrgrgoMcntgoMcnnHpDIffKIDNeeMeDaegPnEBfjP8EpmnP8EpmmcCKrmwgiMOprgiMOppHpDIffKIDNeeMeDaegPnEBfiP8EmmnP8EmmmcFKtbugiMIkmgiMIkkHpDIeeKIDNeeMeDaegPnEBeiP5EjpnP5EjppcFKxhxgfMHffgfMHffHpDIeeKCDOceMeDaefPnEBehP5EgqnP5EgqqcIKwWvgfMKXUgfMKXXHvDHccKCDPceMeDaffPnEBdgP5EdqnP5EdqqcIKxexgcMPQMgcMPQQHvDHccJ/DQdeMeDZffPnEBbfP5EZpmP5EZppcIKwlzgZMYIIgZMYIIHvDHccJ/DQdeMeDZffPhECXfP8EXmnP8EXmmcLKyWxgWMoDJgWMoDDHvDHccKCDQceMeDZffPeEEXfP8EVmnP8EVmmcLK2cxgWM6DMgWM6DDHvDIccKCDQdeMeDYffPhEGTeP8ETmnP8ETmmcLK1iygTNMIVgTNMIIHvDIccJ/DQdeMeDYffPeEJVdP8ERlmP8ERllcLK2mzgQNVUcgQNVUUHvDIccJ/DQdeMbDXffPeENUdP8EQlkP8EQllcLK1pzgQNabdgQNabbHvDIddJ/DQdeMbDXffPeERUcPeERUUPeERUUcOK2XxgQNWgYgQNWggHyDIccJ/DQdeMbDXffPeEWUcPeEWUUPeEWUUcOK2aygNNPkTgNNPkkHyDIccKIDPdeMbDWffPeEZUbPeEZUUPeEZUUcOK0dygNNKhWgNNKhhHyDIccKIDPdeMVDXeePeEbVbPeEbVVPeEbVVcOK1gzgHNOSXgHNOSSHyDIccKIDPdeMVDXeePeEdWbPeEdWWPeEdWWcOK1izgENYSegENYSSHyDIddKIDQeeMVDXeePeEfWbPeEfWWPeEfWWcOK2jygENiRdgENiRRHyDHddKIDQeeMVDXeePeEhXaPeEhXXPeEhXXcRK8TugENoPegENoPPHyDHddKIDQeeMVDXdeOxEpFbOxEpFFOxEpFFcRLCXrgENwNagENwNNHyDHddKIDQeeMVDXdeOxExEaOxExEEOxExEEcRLFbogEN3KWgEN3KKHyDHddKIDQeeMVDXdeOxE5FaOxE5FFOxE5FFcRLHgmgBN+QVgBN+QQHyDHddKIDQfeMVDXdeO0FBCaO0FBCCO0FBCCcRLFkjgBOHQYgBOHQQHyDGddKIDQfeMVDXdeO0FKCaO0FKCCO0FKCCcRLFoif7OQabf7OQaaHyDGddKIDQfeMVDXdfO0FSCaO0FSCCO0FSCCcULEeif+OYcgf+OYccHyDGeeKIDQfeMVDYdfO0FZDaO0FZDDO0FZDDcULBkigBOhYmgBOhYYHyDGeeKIDQfeMVDYdfO0FhDaO0FhDDO0FhDDcUK+pjgEOmTmgEOmTTHyDGeeKIDQfeMVDYdfO0FoEaO0FoEEO0FoEEcXK5njgHOtSlgHOtSSHyDGeeKIDQfeMVDZdfO3FvBaO3FvBBO3FvBBcdKxckgKOxUlgKOxUUHyDGeeKIDPgeMVDZefO3F1CaO3F1CCO3F1CCcdKsfmgKOviogKOviiHyDGeeKIDPgfMYDZcfO0F6HaO0F6HHO0F6HHcgKrPkgKOonqgKOonnHyDGeeKIDOgfMYDZcgO0GAHaO0GAHHO0GAHHcgKxMlgEOepsgEOeppHyDGeeJ/DPdfMYDZcgO0GGHaO0GGHHO0GGHHcgK8MngBOUusgBOUuuHyDGeeKCDPdfMYDadgO0GLHaO0GLHHO0GLHHcgLHPpgBOOtvgBOOttHyDGeeJ/DQdfMYDadgO0GOHaO0GOHHO0GOHHcgLSXtgrOWJqgrOWJJHyDGeeJ/DQdfMeDacfOxGRIaOxGRIIOxGRIIcjLXSugrOcVqgrOcVVHyDGeeJ8DQefMeDbcfOxGXKaOxGXKKOxGXKKcjLZaxgrObdsgrObddHyDGeeJ8DQffMeDbdfOxGdLZOxGdLLOxGdLLcjLXiygrOXjsgrOXjjHyDGeeJ8DQffMeDcdfOxGjGZOxGjGGOxGjGGcjLWoygoOSstgoOSssHyDGeeJ8DQffMeDddfOuGpLZOuGpLLOuGpLLcmLWgzgrONmsgrONmmHyDGeeJ8DQffMeDcefOuGwMYOuGwMMOuGwMMcpLXewgrOHmtgrOHmmHyDGeeJ8DQfeMeDcefOrG0RYOrG0RROrG0RRcsLagwgrOEmsgrOEmmHyDGeeJ/DPeeMeDbffOxG6IXOxG6IIOxG6IIcsLUozgrN7mrgrN7mmHyDGeeJ/DPeeMeDbffOuHFPXOuHFPPOuHFPPcsLMs1goNwtqgoNwttHyDGeeJ/DOeeMeDageOuHGRXOuHGRROuHGRRcvLFn0goNnrsgoNnrrHyDGeeJ/DOeeMeDageOuHHSXOuHHSSOuHHSSYwKtddgoNapwgoNappHyDGeeJ/DOeeMeDZgeOuHIUXOuHIUUOuHIUUYwKrlphkNoAghkNoAAHyDGeeJ/DNdeMeDZgeOuHKVYOuHKVVOuHKVVYzKnlthkN6JjhkN6JJHyDGeeJ/DNdeMeDZgeOuHMVYOuHMVVOuHMVVYzKgqwhzONAhhzONAAHyDGeeKIDMeeMeDZgeOuHNVZOuHNVVOuHNVVc7LXhvhwObKlhwObKKHyDGeeKIDMeeMeDZgeOuHNZYOuHNZZOuHNZZc7LTkthwOadrhwOaddHyDGeeKIDMfeMeDafeOuHNZYOuHNZZOuHNZZZCKbJthtOPrwhtOPrrHyDGeeKIDMfeMeDaffOuHOYaOuHOYYOuHOYYZCKgRuhtOFxyhtOFxxHyDGeeKIDMfeMeDbhfOuHPYcOuHPYYOuHPYYZCKlYwhwN8v1hwN8vvHyDGeeKIDMfeMeDbhfOrHOhcOrHOhhOrHOhhZFKpUvhwNux1hwNuxxHyDGeeKIDLfdMeDchfOrHPhcOrHPhhOrHPhhZFKrbviCNsVuiCNsVVHyDGeeJ/DNddMeDdhfOuHQacOuHQaaOuHQaaZFKsjwiFN2QtiFN2QQHyDGeeJ8DNedMeDeifOrHOhdOrHOhhOrHOhhZFKqoxiIN/SsiIN/SSHyDGeeJ8DNedMeDfjfOrHNidOrHNiiOrHNiiZIKmmyiIN/dviIN/ddHyDGeeJ/DNedMeDfjfOrHMifOrHMiiOrHMiiZIKgrziIN+jwiIN+jjHyDGeeJ/DNeeMeDfkgOrHKieOrHKiiOrHKiiZIKZv0iLN8ctiLN8ccHyDGeeJ2DOceMeDfkgOrHIifOrHIiiOrHIiiZLKVs0iIN3mviIN3mmHyDGeeJ2DPceMeDfkfOoHGlfOoHGllOoHGllZOKRnziIN2kuiIN2kkHyDGeeJzDPdeMeDfkfOoHDleOoHDllOoHDllZRKPfyiIN0iviIN0iiHyDGeeJzDPdeMeDekfOlHBleOlHBllOlHBllZUKPXxiIN3guiIN3ggHyDGeeJ2DPdeMeDdjfOlG/kfOlG/kkOlG/kkZXKSVwiIN6gviIN6ggHyDGeeJzDPdfMeDdjfOlG9jeOlG9jjOlG9jjZaKYWviIN+gwiIN+ggHyDGeeJzDPefMeDkkfOiG7idOiG7iiOiG7iiZaKbewiLOERqiLOERRHyDGeeJzDPefMeDjjfOiG7ifOiG7iiOiG7iiZdKbguiLOMTqiLOMTTHyDGeeJzDOefMeDjhfOiG6heOiG6hhOiG6hhZaKWrviLOTZriLOTZZHyDGeeJzDOefMeDjgfOiG6gdOiG6ggOiG6ggZdKQpviLOVftiLOVffHyDGeeJzDOefMeDkffOfG4hbOfG4hhW+IVGGZaKIxviLOUkuiLOUkkHyDGeeJzDNefMeDmefOfG4gbOfG4ggW7IlFFcyK1etiLOPowiLOPooHyDGeeJzDNefMeDodfOfG3gcOfG3ggW1I/FFcvK0nliLOJoviLOJooHyDGeeJzDNefMeDpcfOfG3fcOfG3ffWyJTFFcyKwieiLOFmtiLOFmmHyDGeeJzDNefMeDsbfOfG2ebOfG2eeWvJlJJWvJlJJiLN/kpiLN/kkHyDGeeJzDNefMeDvafOfG0dbOfG0ddWvJmJJWvJmJJiIN5mkiIN5mmHyDGeeKIDKceMeDxZfOcG0ecOcG0eeWvJqJJWvJqJJiIN0ifiIN0iiHyDGeeKIDKceMeD0YfOcG0edOcG0eeWvJuKKWvJuKKiFNxhbiFNxhhHyDGeeKIDKceMeD3YfOZG2cdOZG2ccWyJtHHWyJtHHiCNwdXiCNwddHyDGeeKIDLceMeD6YeOZG4ceOZG4ccWyJzMMWyJzMMiCNxWUiCNxWWHyDGeeKIDLceMeD9YeOZG5dfOZG5ddWyJ3RRWyJ3RRh/N4TTh/N4TTHyDGeeKIDLceMeEAXeOWG6dgOWG6ddW1JyUUW1JyUUh8OBUVh8OBUUHyDGeeKIDLceMeEEYeOWG7egOWG7eeW1JxYYaTKmaah8OOZYh8OOZZHyDGeeKIDLceMeEHZeOWG7giOWG7ggW1JwaaaQKncdh8OOfch8OOffHyDGeeKIDLceMeEKaeOWG5hjOWG5hhW4JjUUaQKoekh5OHngh5OHnnHyDGeeKIDLceMeENbeOTG3ilOTG3iiW4JhWWaNKliph5N8mjh5N8mmHyDGeeKIDLceMeEQceONG1imONG1iiW7JXQQaNKkkqh2N0kkh2N0kkHyDGeeKIDLdeMeETdeOQG0knOQG0kkW7JZRRaNKikrh2Nwgjh2NwggHyDGeeKIDLdeMeEUfdOKGwmpOKGwmmW7JbRRaNKekrhzNxhihzNxhhHyDGeeKIDMdeMeEVidONGumqONGummW+JbLLaNKbjphzN1gihzN1ggHyDGeeKIDMdeMeEWkdONGrmrONGrmmW+JgLLaKKXoohwNxjkhwNxjjHyDGeeKIDMdeMeEWmdONGomsONGommW+JmMMaNKUcghwNujohwNujjHyDGeeKIDNdeMeEWoeONGkmsONGkmmXBJmEEXBJmEEhtNknshtNknnHyDGeeKIDNdeMeEWpeONGhltONGhllXBJtFFXBJtFFhtNgmuhtNgmmHyDGeeKIDNdeMeEVreONGeltONGellXBJ2IIXBJ2IIhtNfjthtNfjjHyDGeeKIDNdeMeETteOKGamuOKGammXEJ2AAXEJ2AAhtNgjqhtNgjjHyDGeeKIDOdeMeERtfOKGYluOKGYllXEKADDXEKADDhqNckohqNckkHyDGeeKIDOdeMeENufOKGXkuOKGXkkXHJ8AAaKK1HMhqNVkmhqNVkkHyDGeeKIDOeeMeEKufOKGWjuOKGWjjXHKCDDaKK+KOhnNPjkhnNPjjHyDGeeKIDOeeMeEGvgOKGViuOKGViiXHKHLLaKLDORhnNLhh1lSQKKHyDGeeKIDOeeMeECvgOKGTiuOKGTiiXKJ/JJaKLDTVhkNLgg1lSbciHyDGeeKIDOeeMeD+vgOKGRhuOKGRhhXKKDNNaELEWXhkNPeg1oSdajHyDGeeKIDOfeMeD5vgOHGRpuOHGRppXKKGRRaELFXYhhNLij1oSZlsHyDGeeKIDOfeMMD5ffOHGQpuOHGQppXNKJMMaBLKbbheNJppheNJppHyDGeeKIDOfeMMD4hgOHGQquOHGQqqXNKQQQaBLNddaBLNddaBLNddHyDGeeKIDNfeMJD0mgOHGOqvOHGOqqXQKSLLaBLQgfaBLQggaBLQggHyDGeeKIDNfeMJDyohOHGMruOHGMrrXQKUQQaBLRjiaBLRjjaBLRjjHyDGeeKIDNfeMJDvphOHGKrvOHGKrrXQKVVVaELSijaELSiiaELSiiHyDGeeKIDMfeMJDsqhOHGHrvOHGHrrXTKOOOaKLTdjaKLTddaKLTddHyDGeeKIDMfeMJDpqhOHGErvOHGErrXTKSRRaNLUfhaNLUffaNLUffHyDGeeKIDMfeMJDlqhOHGBrvOHGBrrXWKSKKaQLSggaQLSggaQLSggHyDGeeKIDMfeMJDiqhOHF/rvOHF/rrXWKYNNaNLMpjaNLMppaNLMppHyDGeeKIDMfeMMDcogOHF8rvOHF8rrXWKeRRXWKeRRXWKeRRXWKeRRHyDGeeKIDLfeMPDYlgOHF3rvOHF3rrXZKiLLXZKiLLXZKiLLXZKiLLHyDGeeKIDLfeMMDWngOHFzrvOHFzrrXZKkOOXZKkOOXZKkOOXZKkOOHyDGeeKIDLeeMeDSogOHFvqvOHFvqqXZKkRRXZKkRRXZKkRRXZKkRRHyDGeeKIDLeeMeDSngOHFspvOHFsppXZKkSSXZKkSSXZKkSSXZKkSSHyDGeeKIDLeeMeDSmgOHFqpuOHFqppXZKiTTXZKiTTXZKiTTXZKiTTHyDGeeKIDMeeMeDRlfOHFoouOHFoooXZKhTTXZKhTTXZKhTTXZKhTTHyDGeeKIDMeeMeDQlfOHFmnuOHFmnnXWKmddXWKmddXWKmddXWKmddHyDGeeKIDMeeMeDPkfOHFknuOHFknnXWKnccXWKnccXWKnccXWKnccHyDGeeKIDMeeMeDPjfOHFimtOHFimmXWKpbbXWKpbbXWKpbbXWKpbbHyDGeeKIDMeeMeDOjfOHFgntOHFgnnXWKpbbXWKpbbXWKpbbXWKpbbHyDGeeKIDMdeMeDOjfOHFdntOHFdnnXWKnbgXWKnbbXWKnbbXWKnbbHyDGeeKIDMdeMeDNifOHFantOHFannXTKmmmXTKmmmXTKmmmXTKmmmHyDGeeKIDMeeMeDNifOEFYssOEFYssXTKkmmXTKkmmXTKkmmXTKkmmHyDGeeKIDMeeMeDNhfOEFWtsOEFWttXTKhnnXTKhnnXTKhnnXTKhnnHyDGeeKIDMeeL9DRdeOEFStsOEFSttXTKdmpXTKdmmXTKdmmXTKdmmHyDGeeKIDMeeL9DRdeOEFNtrOEFNttXTKbmpXTKbmmXTKbmmXTKbmmHyDGeeKIDMeeMADRceOEFIurOEFIuuXTKYmpXTKYmmXTKYmmXTKYmmHyDGeeKIDMefMADRceOEFEtsOEFEttXTKWmpXTKWmmXTKWmmXTKWmmHyDGeeKIDMeeMADRdeOEE/tsOEE/ttXTKRmqXTKRmmXTKRmm1QRfppHyDGeeKIDMeeMADRdeOEE6trOEE6ttXTKMmqXTKMmmXTKMmm1QRTssHyDGeeKIDMeeMVDPdeOEE1trOEE1ttXQKHrsXQKHrrXQKHrrXQKHrrHyDGeeKIDMeeMYDOdeOEEwsrOEEwssXQKDrtXQKDrrXQKDrrXQKDrrHyDGeeKIDMeeMYDPdeOEErsrOEErssXQJ9rucjLULScjLULLcjLULLHyDGeeKIDMeeMYDPeeOEEmsqOEEmssXNJ1vvcjLVUhcjLVUUcjLVUUHyDGeeKIDMeeMYDOeeOEEirqOEEirrXNJwvwcjLUbncjLUbbcjLUbbAADIAAKIDMeeMYDOefOEEdrqOEEdrrXNJowwcjLReqcjLReecjLReeAADIAAKIDMefMYDOefOEEZqpOEEZqqXNJevxcjLRercjLReecjLReeAADIAAKIDMefMYDOefOEEVqnOEEVqqXKJTwwcjLVetcjLVeecjLVeeAADIAAKIDMefMYDNffOBEStoOBESttXHJKvvcjLYftcjLYffcjLYffAADIAAKIDMefMeDMeeOEEOooOEEOooXHJBttcmLdSocmLdSScmLdSSAADIAAKIDMefMeDMeeOEEKooOEEKooXEI5uucmLjXqcmLjXXcmLjXXAADIAAKIDMefMeDNeeOBEGsoOBEGssXEI1ttcmLlbrcmLlbbcmLlbbAADIAAKIDMefMeDNeeOBEDroOBEDrrXEIxrrcmLoescmLoeecmLoeeAADIAAKIDMefMeDNedOBEAroPqD9ppXEIsqqcmLpiscmLpiicmLpiiAADIAAKIDMefMeDNedOBD9qnPqD7qqXEInoocpLqVrcpLqVVcpLqVVAADIAAKIDMffMeDNedOBD6pmPtD9srXEIjorcpLtascpLtaacpLtaaAADIAAKIDMffMeDOedPnDypmPtD5srXEIforcpLsetcpLseecpLseeAADIAAKIDMffMeDOeePnDwqlPtD0rrXEIcoscpLsgucpLsggcpLsggAADIAAKIDMffMeDOeePnDvqkPtDwrrXEIYptcpLrhtcpLrhhcpLrhhAADIAAKIDMffMeDNfePnDsqlPqDsrrXEISqwcpLpiscpLpiicpLpiiAADIAAKIDMffMeDNfeNgDzjlNgDzjjXEILsxcpLoipcpLoiicpLoiiAADIAAKIDLfeLxDSeeNgDzjkNgDzjjXEIEtycpLphncpLphhcpLphhAADIAAKIDLffL0DSdeNgDzjkNgDzjjXEH7vzcpLrhlcpLrhhcpLrhhAADIAAKIDLffL3DSdeNgDxklNgDxkkXEHyw1cpLpijcpLpiicpLpiiAADIAAKIDLfeL0DSeeNgDvklNgDvkkXEHnx1cmLlllcmLlllcmLlllAADIAAKIDLfeL3DRbdNgDtllNgDtllXEHdx1cmLkmncmLkmmcmLkmmAADIAAKIDKfeL3DRbdNgDrllNgDrllXEHSy1cmLglocmLgllcmLgllAADIAAJ5DNceL3DRbdNdDpqlNdDpqqXHHJuzcjLaorcjLaoocjLaooAADIAAJ5DNcdL3DRadNdDoqmNdDoqqXHG/vycjLYorcjLYoocjLYooAADIAAJ5DNddL3DRadNdDmqmNdDmqqXHG2vycjLWoqcjLWoocjLWooAADIAAJ5DNddL3DRZdNdDjqoNdDjqqXHGtvxcjLSnncjLSnncjLSnnAADIAAJ5DOddLlDUYdNdDgqnNdDgqqXHGkuwcjLOlkcjLOllcjLOllAADIAAJ5DOddLoDVVdNdDcqpNdDcqqXEGbuucjLLlicjLLllcjLLllAADIAAJ5DOedLoDXVdPeDOjmQIDPffXEGTtucjLJkjcjLJkkcjLJkkAADIAAJ5DOeeLrDZRdPnDMgjQLDYdeXEGNstcjLHjkcjLHjjcjLHjjAADIAAJ5DOfeLrDcQdPnDMgfQLDaceXBGHuscjLEkncjLEkkcjLEkkAADIAAJ5DOfeLrDfPdOWDVbbQODobdXBGCttcgLAprcgLAppcgLAppAADIAAJ2DOffLrDhOdOWDXccQODsbcXBF+tpcgK+qucgK+qqcgK+qqAADIAAJ2DOffLrDlNdOWDYddQRD/bbXEF4ppcgK3sxcgK3sscgK3ssAADIAAJ5DNffLrDpNdLrDpNNQREEabXEFwpmcgKxtycgKxttcgKxttAADIAAJ5DNgfLrDtNdLrDtNNQUEYbbXBFpukcdKpxzcdKpxxcdKpxxAADIAAJ8DMffLrDwOdLrDwOOQUEcdcWvFuVVcmKmnycmKmnncmKmnnAADIAAJtDOfgLrD0PdLrD0PPQXEshdWvFsTTcpKljxcpKljjcpKljjAADIAAJtDOfgLrD2QdLrD2QQQXEtjfWvFqRRcpKhnwcpKhnncpKhnnAADIAAJ/DLfgLrD5SdLrD5SSQaEypiWvFpQQcpKZsucpKZsscpKZssAADIAAKCDKdfLrD7UeLrD7UUQdEwskWvFoPPcpKMuscpKMuucpKMuuAADIAAKCDKdfLrD+WeLrD+WWQaEsqkWsF2MMcpKBxpcpKBxxcpKBxxAADIAAKIDJcfLrEAZeLrEAZZQaEnqlWsF2MMcpJ4xncpJ4xxcpJ4xxAADIAAKIDJceLuEAWeLuEAWWQXEjolWsF2NNcsJ0nmcsJ0nncsJ0nnAADIAAKFDKbeLrEBefLrEBeeQUEgnmWsF0NNcsJzqmcsJzqqcsJzqqAADIAAKFDKbeLrEBhfLrEBhhQUEfnmWsFyOOcsJstncsJsttcsJsttAADIAAKFDKbeMDEEGeMDEEGGQUEcmnWpGCTTcsJjwpcsJjwwcsJjwwAADIAAKFDLbeMDEHIeMDEHIIQUEZlnWpF+VVcsJVyqcsJVyycsJVyyAADIAAKFDLbdMDELJeMDELJJQREXmnWpF6VVcsJEzqcsJEzzzeMjVVAADIAAKFDLadMDEPLfMDEPLLQREWmnWpF4XXcsIz0pcsIz00zeMsbjAADIAAKFDMbdMDESNgMDESNNQREUlmWpF2YYcpIi1pcpIi11zeMsiqAADIAAKFDNbeMDEVPhMDEVPPQvEWqnWmF6mmcFIahncFIahhzeMhmsAADIAAKFDNceMDEYRiMDEYRRQvEXqnWmF3oocCIXjmg6JBJJzbMUqdAADIAAKFDNdfMDEaUjMDEaUUQyEpsrWmFyppcCIXiog6JQMMzbMNibAADIAAKFDOefMDEcWkMDEcWWQ1E6tsWmFtrrcCIXiqg3JaVWzYMOZTAADIAAKFDOffMDEdYlMDEdYYQ1E5utWmFmttcCIWhrg3JbhhtMLeALAADIAAKFDPfgMDEdalMDEdaaQ4FJvuWmFfvwcCIUfsg3JUoptML0ASAADIAAKFDPfgMDEccnMDEcccQ4FHwuWmFXvxcCITeqg0JEtttMMDHZAADIAAKFDQfgMDEcenMDEceeQ7FTyvQ7FTyycCIUcncCIUcctJMGdiAADIAAKFDQfgMDEcfnMDEcffQ7FQzxQ7FQzzcCIWancCIWaatJMIkdAADIAAKFDPggMDEbhnMDEbhhQ+Fa0xQ+Fa00cCIXYocCIXYYtJL+mdAADIAAKIDPegMDEainMDEaiiRBFm2yRBFm22cCIZWncCIZWWtJLzmgAADIAAKIDOfgMDEZkmMDEZkkRBFi2zRBFi22cCIeVmcCIeVVtJLrojAADIAAKIDMfgMDEYmlMDEYmmREFw3wREFw33cCIkVkcCIkVVzVMmPbAADIAAKIDLfgMDEXnlMDEXnnREFr3sREFr33cCIpUjgiJTJJzSMzPdAADIAAKIDJggMGEWekMGEWeeRHFz2qRHFz22cCIrUhgiJdRUzPNAfmAADIAAKIDIggMGEVgkMGEVggRKFzzqRKFzzzbbIrEkgiJhZczSNGYnAADIAAKIDHggMGETikMGETiiRKFuysRKFuyybeI2DibeI2DDzSNFcoAADIAAKIDHggMGEQkkMGEQkkRNFptrRNFpttbeJAHkbeJAHHzSNFflAADIAAKIDHggMGEOlkMGEOllRNFktsRNFkttbeJHLkbeJHLLzVNMMWAADIAAKIDHggMGEMmkMGEMmmRNFfssRNFfssbeJOQkbeJOQQzVNWSYAADIAAKIDHggMGEInkMGEInnRNFbrsRNFbrrbhJXIhbhJXIIzVNfbbAADIAAKIDHggMGEEolMGEEooRNFXrtRNFXrrbhJhMgbhJhMMbhJhMMAADIAAKIDHffMDEAtjMDEAttRNFTqtRNFTqqbwJxDebwJxDDbwJxDDAADIAAKIDHffMDD9tjMDD9ttRNFQptRNFQppbzJ9HdbzJ9HHbzJ9HHAADIAAKIDHeeMDD5tjMDD5ttRNFNptRNFNppbzKGPebzKGPPbzKGPPAADIAAKIDGeeMDD2tiMDD2ttRNFJptRNFJppbzKJYhbzKJYYbzKJYYAADIAAKIDGeeMDDytiMDDyttRNFFotRNFFoobzKLhkbzKLhhbzKLhhAADIAAKIDGeeMDDusjMDDussRKFAruRKFArrb2KKfmb2KKffb2KKffAADIAAKIDGeeMDDqsiMDDqssRKE9rtRKE9rrb2KFkpb2KFkkb2KFkkAADIAAKIDGeeMDDmriMDDmrrRKE6qtRKE6qqb2KBosb2KBoob2KBooAADIAAKIDGeeMADjuhMADjuuRKE2prWpFFGJb5J6ftb5J6ffb5J6ffAADIAAKIDGeeMADfuhPnDLeeRKEypqWpFLHLb5J3ivb5J3iib5J3iiAADIAAKIDGeeMADcthPnDMeeRKEtoqWmFRJOb5J1lxb5J1llb5J1llAADIAAKIDGeeMADZthPnDMeeRHEpspWjFYLQb5Jzoyb5Jzoob5JzooAADIAAKIDGeeMADXsgPnDNeeRHElspWjFhMQb8Jzeyb8Jzeeb8JzeeAADIAAKIDGeeMADUrgPnDNeeRHEisoWjFmNRb8Jujzb8Jujjb8JujjAADIAAKIDGeeMDDRngPnDNeeRHEfsnWjFrORb8Jrn0b8Jrnnb8JrnnAADIAAKIDGeeMDDQmgPnDNeeRHEctnWjFvORb/Jqazb/Jqaab/JqaaAADIAAKIDGeeMDDPlgPnDNedRHEYtmWjF0OQcCJsNxcCJsNNcCJsNNAADIAAKIDGeeMDDOkgPnDNeeRHETtlWjF5NPcCJxQwcCJxQQcCJxQQAADIAAKIDGeeMGDNfgPnDNfeRHEPtkWjGAMOcFJ4GscFJ4GGcFJ4GGAADIAAKIDGeeMGDNefPnDOfeRHEKtkWjGGLOcFKAIqcFKAIIcFKAIIAADIAAKIDGeeMGDNefPeDOdeRHEEtjWjGMLPcFKIKncFKIKKcFKIKKAADIAAKIDGeeMJDNbfPeDPdeRHD+thWjGRMPcFKQNkcFKQNNcFKQNNAADIAAKIDGeeMJDNcfPeDPdeQCEBghWgGWNRcFKXRfcFKXRRcFKXRRAADIAAKIDFeeMMDNbfPeDPeeQFEBZgWgGdMRcFKcYecFKcYYcFKcYYAADIAAKIDFeeMPDNcePeDPefQFEBbhWgGiLScFKfeecFKfeecFKfeeAADIAAKIDFeeMVDMdePeDOefQCEBjjWdGmPTcFKflgcFKfllcFKfllAADIAAKIDFeeMVDNdfPeDOefQFEAfkWjGyDTcFKapjcFKappcFKappAADIAAKIDFeeMVDNefPeDNffQFD+hlWgG0IVcFKRtlcFKRttcFKRttAADIAAKIDFeeMVDMefPnDMffQFD8jlWgG+JXcCKEwocCKEwwcCKEwwAADIAAKIDFeeMVDMefPnDMefQFD5lmWgHHJXcCJ5wqcCJ5wwcCJ5wwAADIAAKIDFeeMVDMefPnDMeeQFD2mnWgHORab8Jvurb8Jvuub8JvuuAADIAAKIDFeeMVDMefPnDMdeQFDynnWgHVVdb5Jossb5Jossb5JossAADIAAKIDFeeMVDLefPnDMdeQFDtonWjHXSgb5Jhtsb5Jhttb5JhttAADIAAKIDFeeMVDKefPnDNceSYDjfjWjHWYlb2Jbtsb2Jbttb2JbttAADIAAKIDFeeMVDKdfPnDOceSSDjfhWjHWeqb2JSutb2JSuub2JSuuAADIAAKIDFeeMVDJdfPnDObeSSDjfgWmHUVrbzJKvtbzJKvvbzJKvvAADIAAKIDFeeMVDJcfPnDPbeSSDjfgW1HaCobzJDwubzJDwwbzJDwwAADIAAKIDFeeMVDJcfPnDQbeSSDifgW1HkDkbzI7wvbzI7wwbzI7wwAADIAAKIDFeeMVDJcePnDRbeSVDiegW1HtHnbzIxvxbzIxvvbzIxvvAADIAAKIDFeeMVDKbePnDRbeSVDiegW1H1KobwIjxxgQJMNNgQJMNNAADIAAKIDFeeMVDLbePnDSceSVDjegWyH7TrWyH7TTWyH7TTWyH7TTAADIAAKIDFeeMVDLbePnDSceSqDifgWyH+YsWyH+YYWyH+YYWyH+YYAADIAAKIDFeeMVDLbePnDSceStDkggWyH/etWyH/eegQJfOTgQJfOOAADIAAKIDFeeMVDMbePnDTceSwDlhgWyH+jtWyH+jjgQJnNQgQJnNNAADIAAKIDFeeMVDMcePnDTdeSzDlefWyH5ouWyH5oogQJvNSgQJvNNAADIAAKIDFeeMVDNcePnDTdeSzDlffWyHzruWyHzrrgQJ1PRgQJ1PPAADIAAKIDFeeMVDNdePnDUeeS2DkcfWvHtvvWvHtvvgQJ7PQgQJ7PPAADIAAKIDFeeMVDNeePnDUfdS2DkdfWvHmwvWvHmwwgQJ/MPgQJ/MMAADIAAKIDFeeMVDNfdPnDVfdS2DkdfWvHdyvWvHdyygNKFKNgNKFKKAADIAAKIDFeeMVDNgePnDUgeS2DjefW1HWtwW1HWttgNKQGNgNKQGGAADIAAKIDFeeMVDMhePnDUgeS2DjefW1HQuwW1HQuugNKdFPgNKdFFAADIAAKIDFeeMYDLcfPnDUheTCDiefW4HLqwW4HLqqgNKtFRgNKtFFAADIAAKIDFeeMYDKdePnDTheTFDieeW4HFrvW4HFrrgNK6ITgNK6IIAADIAAKIDFeeMYDKefPnDSieTFDifeW4G+rvW4G+rrgNLEQVgNLEQQAADIAAKIDFeeMYDKeePnDSieTCDheeW4G4suW4G4ssgQLNQVgQLNQQAADIAAKIDFeeMADMdfPnDRieS8DhdeW4GxtuW4GxttgQLRaYgQLRaaAADIAAKIDFeeMADMefPnDPieS8DiefW4GrutW4GruugTLWXbgTLWXXAADIAAKIDFeeMADNfgPeDQfeS8DieeW4GlutW4GluugWLXSdgWLXSSAADIAAKIDFeeLrDQcfPeDPffS8DiefW4GfvtW4GfvvgZLZJegZLZJJAADIAAKIDFeeLrDRdfPeDPffS8DifeW4GZvtW4GZvvgZLfOfgZLfOOAADIAAKIDFeeLrDQefPeDPffS8DhfeW4GSvtW4GSvvgZLnUhgZLnUUAADIAAKIDFeeLrDQdePeDOffTUDgeeW4GLvuW4GLvvgZLsZigZLsZZAADIAAKIDFeeLrDOefPeDOffTRDfeeW4GCvuW4GCvvgZLvfkgZLvffAADIAAKIDFeeMeDHdfPbDOffTRDfeeW4F5vvW4F5vvgZLsllgZLsllAADIAAKIDFeeMeDHdfPDDPdfTODffeW4FwuvW4FwuugZLnpmgZLnppAADIAAKIDFeeMeDHegPDDPefTODffeW4FouvW4FouugZLgtngZLgttAADIAAKIDFeeMeDHegPYDNgfTODffeW4FgtwcXFuoogZLXvmgZLXvvAADIAAKIDFeeMeDGffPYDMgfTODefeW4FauwcXFmrrgZLOwmgZLOwwAADIAAKIDFeeMeDFffPYDMgfTODdfeW4FVuwW4FVuugcLIrkgcLIrrAADIAAKIDFeeMeDFffPYDLffTaDceeW4FNuwW4FNuugfLEmjgfLEmmAADIAAKIDFeeMeDEffPYDLffTaDcfeW4FGvwcXFNssgfK/oigfK/ooAADIAAKIDFeeMeDEffPnDJeeTLDceeW4E9wwcXFFsugfK6rhgfK6rrAADIAAKIDFeeMeDDffPnDKeeTLDdeeW4EzwvcXE+sugiK0kggiK0kkAADIAAKIDFeeMeDDffPnDKefTLDdeeW4EqxvcaE3msgiKvlegiKvllAADIAAKIDFeeMeDDffPnDKefTLDdefW4EhxvcaExmsgiKolggiKollAADIAAKIDFeeMeDDffPnDKeeTODddfW4EZxwcaErlrgiKhkkgiKhkkAADIAAKIDFeeMeDDeePnDKdeTODdefW4EQwwdrEoYpgiKbkpgiKbkkAADIAAKIDFeeMeDDddPnDKddTODcefW1EIxvdrEvdqgfKWqugfKWqqAADIAAKIDFeeMeDDddPnDKddTODcffW1D/wudrEyipgiKUiwgiKUiiAADIAAKIDFeeMeDDccPnDKddTODbffWyD4wtdrEyppgiKSjygiKSjjAADIAAKIDFeeMeDEccPnDLddTODbffWyDxvtdrEttpgiKTmygiKTmmAADIAAKIDFeeMeDEccPnDLddTRDaefXfDoqrdrEnwmglKRfyglKRffAADIAAKIDFeeMSDGccPnDMddTRDaefXfDiqpcXEimkglKPkyglKPkkAADIAAKIDFeeMSDHccPnDMdeTUDZefXcDeqmcXEgpkglKHqyglKHqqAADIAAKIDFeeMVDIbcPnDMdeTgDYdfXfDaomcaEbkmgoKEhxgoKEhhAADIAAKIDFeeMVDIcdPnDNdfTgDYefXfDWnlcaEZnngoJ/mxgoJ/mmAADIAAKIDFeeMVDJddPnDNdfTXDZdfXfDTljcdEWgngoJ5rwgoJ5rrAADIAAKIDFeeMVDKdePnDNdfTXDZefX3DRgicdETkngrJxfugrJxffAADIAAKIDFeeMYDKddPnDOdfTXDZefX6DQggcgETelgrJqktgrJqkkAADIAAKIDFeeMYDLdePnDOdfTODZeeX3DOhfcgEQikgrJiorgrJiooAADIAAKIDFeeMYDLeePnDOeeTODZeeYMDNYacgEOljgrJZqpgrJZqqAADIAAKIDFeeMbDKeePnDOeeTODZeeUWDdYbcjEMfhgrJPspgrJPssAADIAAKIDFeeMeDJdePnDPeeTODZfeYMDSTacjELhigrJFrpgrJFrrAADIAAKIDFeeMeDIdePnDOfeTODYfeYMDWRYcjEIjhgrI7qrgrI7qqAADIAAKIDFeeMeDIeePnDOfeTODYffYJDdPZcjEHkggrI1prgrI1ppAADIAAKIDFeeMeDIeePnDOgeTaDXdfYJDjPbcjEElggrIworgrIwooAADIAAAADIAAMeDIffPnDNgeTaDXdfYJDpSccjECqfgrIsnrgrIsnnAADIAAAADIAAMeDIffPnDMgdTaDXdfYJDuXdcmD/kggrIkmrgrIkmmAADIAAAADIAAMeDIggPnDMgdTaDYdfYJDvcfcmD8nfgoIenqgoIennAADIAAAADIAAMeDIggPkDLedTdDYdeYGDvjiYnEDddgoIbmpgoIbmmAADIAAAADIAAKvDFeePhDLedTdDYdfYJDrjiYnEBdcglIZloglIZllAADIAAAADIAAKvDFeePhDLedTdDYefYJDlliYnEAdZglIYmmglIYmmAADIAAAADIAAKsDFeePeDLddTdDYffYMDiejdrD3dZglIUomglIUooAADIAAAADIAAKsDFeePeDMedTdDXffYMDjcidrD7cagiILulgiILuuAADIAAAADIAAKsDFeePVDNcdTdDXgfYMDmcidrD/ccgiIBvlgiIBvvAADIAAAADIAAKsDFeePVDOdeTaDWgeYMDqchdrEDbdgiH2wmgiH2wwAADIAAAADIAAKpDFeePYDOceTgDVgeYMDuegdrEHcegiHpwngiHpwwAADIAAAADIAAKpDFeePnDNdfTgDUgeYMDwggdrELdfgfHcwogfHcwwAADIAAAADIAAKpDFeePnDNdfTXDUfeYMDwifdrEQfbgfHRuqgfHRuuAADIAAAADIAAKmDFeePnDOdfTUDUfeYMDvlddrETiZgfHItr94JmEOAADIAAAADIAAKmDFeePnDOefTUDUfeYMDsncdrEVlZgcHCts97J/CPAADIAAAADIAAKmDFeePnDOefTUDUeeYMDpnadrETnagcG5stxRI8NWAADIAAAADIAAKmDFeePnDOffTUDUeeYMDmnadcEaGZgZGxtuxRJKUcAADIAAAADIAAKjDFeePnDNffSYDYefXfDmOXdZEjJZgZGotvxRJPdlAADIAAAADIAAKjDFeePnDNffTXDUbfXfDqOWdZEtLXgZGguxxRJLkuAADIAAAADIAAKjDFeePnDMffTXDUafXZDvNXdZE3NWgcGZoyxUJLXuAADIAAAADIAAKjDFeePnDMffTXDVZfXZD1MWdZE+SXgcGTpzxUJQarAADIAAAADIAAAADIAAPnDMffTXDXYeXZD7KVdZFCXXgcGKrzxUJVenAADIAAAADIAAAADIAAPnDMfeTXDZYeXZEBJUdZFEeZgcGAt0xXJYUhAADIAAAADIAAAADIAAPnDMfeTXDaYeXZEIJUdZFDjdgfF4lyxXJXWdAADIAAAADIAAAADIAAPnDLeeTXDcYdXZEPIRdZFAohgfFxnyxXJcZaAADIAAAADIAAAADIAAPnDMeeTXDdZdXZEWIQdWE4qlgfFqpyxaJmUcAADIAAAADIAAAADIAAPnDMeeTUDfadXZEdIRdTEyrpgfFhryxaJnniAADIAAAADIAAAADIAAPnDMdeTUDgcdXWEjKRdQEruuj9FmKoxdJYsmAADIAAAADIAAAADIAAPnDMdeTUDhddXWEpLRXWEpLLj9FvMgxsJTcmAADIAAAADIAAAADIAAPnDNdeTRDideXWEvMSXWEvMMj6F1ThxvJDnnAADIAAAADIAAAADIAAPnDOdeTODiceXWE1NVXWE1NNj6F5Ucx7JCUpAADIAAAADIAAAADIAAPnDOeeTLDjceXWE6OWXWE6OOj6F9Ucx+JFVtAADIAAAADIAAAADIAAPnDOeeTLDjefXWE+PXXWE+PPj6GAUb9vKSVvAADIAAAADIAAAADIAAPnDOeeTLDihfXWFDQZXWFDQQj6GGTZyBJSYxAADIAAAADIAAAADIAAPnDOfeTLDhifXWFHQYXWFHQQj6GLSWyBJUhvAADIAAAADIAAAADIAAPnDOfeTIDfkfXWFKRZXWFKRRj6GPRSyEJWbrAADIAAAADIAAAADIAAPnDNfeTIDdlfXWFORaXWFORRj3GRXOyEJUkrAADIAAAADIAAAADIAAPnDNgeTIDalfXWFSQZXWFSQQj3GWWQyHJWXrAADIAAAADIAAAADIAAPnDNfeTIDXlfXWFWQaXWFWQQj3GaWWyHJShtAADIAAAADIAAAADIAAPnDMfeTIDUkfXWFaQbXWFaQQj0GeYbyHJLquAADIAAAADIAAAADIAAPnDMfdTFDSifXWFePbXWFePPj0GfciyHJCwtAADIAAAADIAAAADIAAPnDLfcTCDSffXTFkQcXTFkQQj0GefnyHIxzsAADIAAAADIAAAADIAAPnDLfcS/DTefXTFpQcXTFpQQj0GbjqyQIjfpAADIAAAADIAAAADIAAOEDWRbS/DTefXTFtRcXTFtRRj0GYoqyTIjcrAADIAAAADIAAAADIAAOEDYTbS/DTffXTFwSbXTFwSSXTFwSSyWIlXtAADIAAAADIAAAADIAAOEDbVcS/DTffXTFyTbXTFyTTXTFyTTyWIkcvAADIAAAADIAAAADIAAOEDdYdS/DSgfXQF0WaXQF0WWXQF0WWyWIigsAADIAAAADIAAAADIAAOEDbbfS/DRgfXQF3XaXQF3XXXQF3XXzGImTnAADIAAAADIAAAADIAAOEDaehTgDOdfXQF5XaXQF5XXXQF5XXy3IlShAADIAAAADIAAAADIAAOBDZkkTgDPefXQF8XbXQF8XXXQF8XXyfI2KmAADIAAAADIAAAADIAAOEDXiiTgDOffXQF/YcXQF/YYXQF/YYyfJEUo"};
const JT = (() => {
  const TH = 352 * Math.PI / 180, UH = [Math.sin(TH), Math.cos(TH)], VH = [Math.cos(TH), -Math.sin(TH)];
  // the berth's own frame: u along the berth toward 352 deg, v toward the sea (82 deg), from the berthing line at the
  // platform's centre
  const L = (u, v, z = 0) => [u * UH[0] + v * VH[0], u * UH[1] + v * VH[1], z];
  const LB = (u0, u1, v0, v1, z0, z1) => E3.box(u0, u1, v0, v1, z0, z1).map(f => f.map(p => L(p[0], p[1], p[2])));
  const up = [0, 0, 1], along = [UH[0], UH[1], 0], across = [VH[0], VH[1], 0];
  const COAST = [[56.2699, 25.6291], [56.2738, 25.6214], [56.2816, 25.6229], [56.28, 25.6137], [56.2893, 25.6067], [56.3067, 25.6108], [56.3362, 25.6042], [56.3557, 25.5939], [56.3549, 25.5524], [56.3698, 25.5251], [56.3603, 25.4868], [56.364, 25.4201], [56.3585, 25.3774], [56.3479, 25.3746], [56.3572, 25.3496], [56.3667, 25.3491], [56.3665, 25.3592], [56.3752, 25.3481], [56.3812, 25.3249], [56.3758, 25.3148], [56.3647, 25.245], [56.3703, 25.2415], [56.3586, 25.1957], [56.361, 25.0682], [56.3756, 24.9811]];
  // 2D convex hull (monotone chain), for shadows and reflections of convex solids
  function hull2(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  function inPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const bbOf = sp => [Math.min(...sp.map(q => q[0])), Math.min(...sp.map(q => q[1])), Math.max(...sp.map(q => q[0])), Math.max(...sp.map(q => q[1]))];
  // paper laid along a stroke (the light core of a tube, so a pipe or an arm reads as a drawn cylinder)
  function paperLine(pts, w) {
    if (w <= 0.2 || pts.length < 2) return;
    ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse());
    ctx.globalAlpha = SA; ctx.strokeStyle = PAPER_PAT; ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.restore();
  }
  // the ranges' compact data (see the notes): 6 base-64 characters a point; 4 a bearing for the shore and the hills' foot
  function ranges(R) {
    const T = {}; 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach((c, i) => { T[c] = i; });
    const dec = (str, i, n) => { let v = 0; for (let k = 0; k < n; k++) v = v * 64 + T[str[i + k]]; return v; };
    const nb = R.shore.length / 4, layers = Array.from({ length: R.n }, () => []), shore = [], foot = [];
    for (let i = 0; i < nb; i++) {
      shore.push(dec(R.shore, i * 4, 2) * 10); foot.push(dec(R.shore, i * 4 + 2, 2) * 10);
      for (let k = 0; k < R.n; k++) { const o = (i * R.n + k) * 6; layers[k].push([dec(R.pts, o, 2) * 10, dec(R.pts, o + 2, 2) - 200, dec(R.pts, o + 4, 1) / 63, dec(R.pts, o + 5, 1) / 63]); }
    }
    return { c0: R.c0, az0: R.az0, daz: R.daz, shore, foot, layers };
  }
  // many short world segments in one stroke per alpha step (as E3.segments, in finer steps, so strokes whose tone the
  // swell moves change by little from frame to frame)
  function segs(list, col, lw, nb = 12) {
    const bands = Array.from({ length: nb }, () => []);
    list.forEach(([a, b, al]) => { if (al <= 0.02) return; const s = E3.clipSeg(a, b); if (s) bands[Math.min(nb - 1, Math.floor(al * nb))].push(s); });
    bands.forEach((g, k) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * (k + 0.5) / nb; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); g.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  }
  return { L, LB, UH, VH, up, along, across, COAST, hull2, inPoly, bbOf, paperLine, ranges, segs };
})();
scene({
  id: 'jetty',
  start: 0, dur: 6.667,
  init() {
    const r = rng(1172), { L } = JT;
    this.F = 14; this.FC = 3.2; this.JZ = 8.2; this.DZ = 6.6;
    this.RG = JT.ranges(JT_RIDGES);
    // the ship's lines: stations [s at the deck, half-breadth at the deck, s at the waterline, half-breadth there], s from
    // the stern (0) to the stem (330); the bow flares (the waterline is finer than the deck and its stem lies aft)
    const ST = [[0, 22, 6, 17], [3, 26.5, 8, 22], [8, 28.8, 12, 26.5], [16, 29.8, 18, 29], [30, 30, 30, 30], [262, 30, 258, 30], [280, 29.4, 274, 28.6], [295, 27.6, 288, 25.6],
      [307, 24.6, 299, 21.4], [316, 20.6, 307.5, 16.4], [322.5, 15.8, 314, 11.2], [326.5, 10.6, 318.5, 6.8], [329, 5.4, 321.5, 3.2], [330, 0, 323, 0]];
    this.ST = ST;
    const ring = (sIdx, bIdx, z) => {
      const pts = [];
      ST.forEach(q => pts.push(this.S(q[sIdx], -q[bIdx], z)));
      ST.slice().reverse().forEach(q => { if (q[bIdx] > 0) pts.push(this.S(q[sIdx], q[bIdx], z)); });
      return pts;
    };
    this.deckPts = ring(0, 1, this.F); this.wlPts = ring(2, 3, 0);
    // the loft: one face per pair of stations on each side, the transom, the deck
    const a = this.wlPts, b = this.deckPts, n = a.length;
    this.hullF = [];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; this.hullF.push([a[i], a[j], b[j], b[i]]); }
    this.deckF = b.slice();
    // the forecastle: the deck's outline forward of s 300, raised 3.2 m
    const fst = [[300, this.bd(300)]].concat(ST.filter(q => q[0] > 300).map(q => [q[0], q[1]]));
    const fr = z => { const p = []; fst.forEach(([s, h]) => p.push(this.S(s, -h, z))); fst.slice().reverse().forEach(([s, h]) => { if (h > 0) p.push(this.S(s, h, z)); }); return p; };
    const f0 = fr(this.F), f1 = fr(this.F + this.FC);
    this.fcsleF = [f1];
    for (let i = 0; i < f0.length; i++) { const j = (i + 1) % f0.length; this.fcsleF.push([f0[i], f0[j], f1[j], f1[i]]); }
    this.fcsleF.push(f0);
    // the jetty: dolphins as { u, v centre, half-length along, half-width across, top, bottom }
    const DZ = this.DZ, JZ = this.JZ;
    this.MD = [-190, -150, -110, 110, 150, 190].map((u, i) => ({ u, v: -24, hu: 5, hv: 5, z1: DZ, z0: DZ - 3, k: 'MD' + (i + 1) }));
    this.BD = [-66.15, -41.65, 41.65, 66.15].map((u, i) => ({ u, v: -9.2, hu: 6, hv: 6, z1: DZ, z0: DZ - 3.2, k: 'BD' + (i + 1) }));
    this.WS = [-88, 88].map((u, i) => ({ u, v: -17, hu: 2.2, hv: 2.2, z1: DZ, z0: DZ - 2, k: 'WS' + (i + 1) }));
    this.PF = { u: 0, v: -18.3, hu: 19.5, hv: 15, z1: JZ, z0: JZ - 2.5, k: 'PF' };
    const M = this.MD, B = this.BD, W = this.WS;
    // walkways W1-W12: MD1-MD2-MD3-WS1-BD1-BD2-platform-BD3-BD4-WS2-MD4-MD5-MD6
    const chain = [M[0], M[1], M[2], W[0], B[0], B[1], this.PF, B[2], B[3], W[1], M[3], M[4], M[5]];
    this.walks = [];
    for (let i = 0; i < chain.length - 1; i++) this.walks.push(this.walkway(chain[i], chain[i + 1]));
    // the loading arms (4 x 16 inch), flanges 4 m apart, their risers 8 m behind the berthing line; each arm reaches from
    // its riser to the ship's manifold flange 4.6 m inboard of her side, 2.1 m above her deck
    this.arms = [-6, -2, 2, 6].map(u => this.arm(u));
    // mooring lines: [fairlead s, the hook's dolphin, the hook's offset along]; fairleads on her starboard side
    const PFs = { u: -18, v: -3.6, hv: 0, z1: JZ }, PFn = { u: 18, v: -3.6, hv: 0, z1: JZ };
    const lines = [[326, M[0], -1.6], [325, M[0], -0.5], [324, M[0], 0.5], [323, M[0], 1.6], // head lines
      [311, M[1], -1], [309, M[1], 1], [305, M[2], -1], [303, M[2], 1], // forward breasts
      [197, PFs, -0.6], [199, PFs, 0.6], // forward springs, leading aft to the platform
      [133, PFn, -0.6], [131, PFn, 0.6], // after springs, leading forward
      [30, M[3], -1], [28, M[3], 1], [24, M[4], -1], [22, M[4], 1], // after breasts
      [8, M[5], -1.6], [7, M[5], -0.5], [6, M[5], 0.5], [5, M[5], 1.6]]; // stern lines
    this.lines = lines.map(([s, D, du]) => {
      const zf = (s > 300 ? this.F + this.FC : this.F) + 0.9, a0 = this.S(s, -this.bd(s) + 0.3, zf);
      const b0 = L(D.u + du, D.v + D.hv - 0.6, D.z1 + 0.8), pts = [], len = Math.hypot(a0[0] - b0[0], a0[1] - b0[1], a0[2] - b0[2]);
      for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push([lerp(a0[0], b0[0], t), lerp(a0[1], b0[1], t), lerp(a0[2], b0[2], t) - 0.014 * len * 4 * t * (1 - t)]); }
      return pts;
    });
    // the breakwater's line: from its round head south of the berth north, parallel to it, to where it turns due west for
    // the shore (its trunk passes the port's directional light, NTM 148: 25 11.622 N 56 22.706 E, 362 m north of the berth's
    // centre and 423 m west of the berthing line); 630 m of arm and 2.3 km of trunk, as the 2.9-3 km the builders give
    this.BW = { u0: -300, u1: 330 };
    this.rocks = [];
    for (let k = 0; k < 2600; k++) this.rocks.push([lerp(this.BW.u0, this.BW.u1, Math.pow(r(), 1.15)), r(), 1.5 + r() * 1.6, r() * TAU, r()]);
    // the sea: fixed marks on the water, laid out once from the camera at mid-beat (rows closing up toward the far water),
    // then projected every frame so they move with the camera and the swell runs through them
    const cam = this.view(4.2), hz = E3.projDir([cam.F[0], cam.F[1], -0.0056 * Math.hypot(cam.F[0], cam.F[1])])[1];
    this.sea = [];
    let y = hz + 1.2;
    while (y < 1110) {
      const gap = 1.6 + 5.2 * Math.pow(clamp((y - hz) / 700), 0.9);
      let x = 20 + r() * 20;
      while (x < 1110) {
        const len = 5 + r() * (10 + 34 * clamp((y - hz) / 600)), g = 3 + r() * 16, xm = x + len / 2;
        const d = [0, 1, 2].map(i => cam.F[i] + cam.R[i] * (xm - cam.cx) / cam.f - cam.U[i] * (y - cam.cy) / cam.f);
        if (d[2] < -1e-4) {
          const t = -cam.C[2] / d[2], p = [cam.C[0] + d[0] * t, cam.C[1] + d[1] * t], dep = t * (d[0] * cam.F[0] + d[1] * cam.F[1] + d[2] * cam.F[2]);
          if (this.onWater(p)) this.sea.push([p[0], p[1], len / 2 * dep / cam.f, r(), dep]);
        }
        x += len + g;
      }
      y += gap * (0.8 + 0.4 * r());
    }
    this.R0 = [cam.R[0], cam.R[1]];
    // the inset: the bulletin sheet in the picture's upper left, its chart of the east coast true to scale at 25.3 N
    const X0 = 64, Y0 = 72;
    this.sheet = new P([[X0, Y0], [X0 + 318, Y0], [X0 + 318, Y0 + 296], [X0, Y0 + 296]], true);
    this.sheetIn = new P([[X0 + 8, Y0 + 8], [X0 + 310, Y0 + 8], [X0 + 310, Y0 + 288], [X0 + 8, Y0 + 288]], true);
    const k = 250 / (25.6291 - 24.9811), kx = k * Math.cos(25.3 * Math.PI / 180), C = ([lo, la]) => [X0 + 74 + (lo - 56.2699) * kx, Y0 + 24 + (25.6291 - la) * k];
    this.coastPts = JT.COAST.map(C); this.coast = new P(this.coastPts, false);
    const cx0 = X0 + 22, cx1 = X0 + 150;
    this.chartBox = new P([[cx0, Y0 + 24], [cx1, Y0 + 24], [cx1, Y0 + 274], [cx0, Y0 + 274]], true);
    const cp = this.coastPts, cyN = cp[0][1], cyS = cp[cp.length - 1][1];
    this.chartSeaA = new P(cp.concat([[cx1, cyS], [cx1, cyN]]), true);
    this.chartLandA = new P(cp.concat([[cx0, cyS], [cx0, cyN]]), true);
    const coastX = yy => { for (let i = 1; i < cp.length; i++) if (cp[i][1] >= yy) { const u = (yy - cp[i - 1][1]) / Math.max(1e-6, cp[i][1] - cp[i - 1][1]); return cp[i - 1][0] + u * (cp[i][0] - cp[i - 1][0]); } return cp[cp.length - 1][0]; };
    this.chartSea = []; for (let yy = Y0 + 32; yy < Y0 + 272; yy += 15) { const x0 = coastX(yy) + 5, pts = []; for (let x = x0; x <= cx1 - 5; x += 5) pts.push([x, yy + 1.2 * Math.sin((x - x0) * 0.35 + yy)]); if (pts.length > 1) this.chartSea.push(new P(pts)); }
    this.textLines = []; for (let j = 0; j < 11; j++) this.textLines.push({ y: Y0 + 40 + j * 18, w: 74 + (j * 37) % 58, x: X0 + 166 });
    this.sign = new P(wob([[X0 + 196, Y0 + 268], [X0 + 208, Y0 + 258], [X0 + 218, Y0 + 270], [X0 + 228, Y0 + 255], [X0 + 242, Y0 + 269], [X0 + 258, Y0 + 262], [X0 + 278, Y0 + 264]], 970, 0.6));
  },
  // is a point of the sea plane short of the shore (the computed coast along its bearing from the ranges' eye)
  onWater(p) {
    const R = this.RG, dx = p[0] - R.c0[0], dy = p[1] - R.c0[1], az = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360, i = Math.round((az - R.az0) / R.daz);
    if (i < 0 || i >= R.shore.length) return true;
    const sd = R.shore[i];
    return !sd || Math.hypot(dx, dy) < sd - 30;
  },
  // ship-local: s from the stern (north) to the stem (south), w across from her centreline (+ to port, seaward), z up
  S(s, w, z) { return JT.L(165 - s, 30 + w, z); },
  SB(s0, s1, w0, w1, z0, z1) { return E3.box(s0, s1, w0, w1, z0, z1).map(f => f.map(q => this.S(q[0], q[1], q[2]))); },
  // the waterline station [s, half-breadth] the loft joins to deck station s
  wlAt(s) { const T = this.ST; for (let i = 1; i < T.length; i++) if (s <= T[i][0]) { const u = (s - T[i - 1][0]) / (T[i][0] - T[i - 1][0]); return [lerp(T[i - 1][2], T[i][2], u), lerp(T[i - 1][3], T[i][3], u)]; } return [T[T.length - 1][2], 0]; },
  bd(s) { const T = this.ST; for (let i = 1; i < T.length; i++) if (s <= T[i][0]) { const u = (s - T[i - 1][0]) / (T[i][0] - T[i - 1][0]); return lerp(T[i - 1][1], T[i][1], u); } return 0; },
  walkway(A, B) {
    const du = B.u - A.u, dv = B.v - A.v, ea = Math.min(A.hu / Math.abs(du || 1e-9), A.hv / Math.abs(dv || 1e-9)), eb = Math.min(B.hu / Math.abs(du || 1e-9), B.hv / Math.abs(dv || 1e-9));
    const a = [A.u + du * ea, A.v + dv * ea, A.z1], b = [B.u - du * eb, B.v - dv * eb, B.z1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nu = -(b[1] - a[1]) / len, nv = (b[0] - a[0]) / len, segs = [], L = JT.L, H = 1.8;
    const P3 = (t, side, zz) => L(lerp(a[0], b[0], t) + nu * 0.8 * side, lerp(a[1], b[1], t) + nv * 0.8 * side, lerp(a[2], b[2], t) + zz);
    const nb = Math.max(2, Math.round(len / 4.2));
    [-1, 1].forEach(side => {
      segs.push([P3(0, side, 0), P3(1, side, 0)], [P3(0, side, H), P3(1, side, H)]);
      for (let k = 0; k <= nb; k++) {
        const t = k / nb; segs.push([P3(t, side, 0), P3(t, side, H)]);
        if (k < nb) segs.push(k % 2 ? [P3(t, side, 0), P3((k + 1) / nb, side, H)] : [P3(t, side, H), P3((k + 1) / nb, side, 0)]);
      }
    });
    return { segs, mid: L((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]), len };
  },
  arm(u) {
    const L = JT.L, JZ = this.JZ, vR = -8, zP = JZ + 9.5, ang = 58 * Math.PI / 180, li = 10.5;
    const apex = [u, vR + li * Math.cos(ang), zP + li * Math.sin(ang)], tail = [u, vR - 3.8 * Math.cos(ang), zP - 3.8 * Math.sin(ang)];
    const W = p => L(p[0], p[1], p[2]);
    return { u, foot: W([u, vR, JZ + 1.1]), pivot: W([u, vR, zP]), apex: W(apex), tail: W(tail), flange: W([u, 4.6, this.F + 2.1]), swiv: W([u, 4.2, this.F + 3.9]), elbow: W([u, 4.5, this.F + 3.1]),
      lever: W([u, vR - 1.3, zP + 1.0]), lever2: W([u, apex[1] - 1.3, apex[2] + 1.0]), cw2: W([u, vR - 1.9, zP - 1.8]),
      cw: JT.LB(u - 0.8, u + 0.8, tail[1] - 1.1, tail[1] + 1.1, tail[2] - 0.9, tail[2] + 0.9), cwb: JT.LB(u - 0.6, u + 0.6, vR - 2.6, vR - 1.2, zP - 2.6, zP - 1.2) };
  },
  // this frame's camera: a long lens (f 4700 px, a 12.8 deg field across the picture) from the sea south-south-east of the
  // berth, held on the platform; over the beat it rises from 88 to 112 m and swings from bearing 157 to 153 deg round the
  // berth at about 1 km, so the ship's bow, the jetty's line and the Hajar slide past one another
  view(lt) {
    const q = clamp((lt - 0.4) / 7.6), u = 0.8 * q + 0.2 * easeInOut(q);
    const b = lerp(157, 153, u) * Math.PI / 180, D = lerp(1030, 1010, u), h = lerp(88, 112, u);
    return E3.camera([D * Math.sin(b), D * Math.cos(b), h], JT.L(lerp(-30, -26, u), -24, 9), 4700, 470, 800);
  },
  // where the horizon, the shore and the ranges fall on screen this frame (the washes and the sea follow them)
  frame(lt) {
    const cam = this.view(lt);
    this.ec = cam;
    this.hz = E3.projDir([cam.F[0], cam.F[1], -0.0056 * Math.hypot(cam.F[0], cam.F[1])])[1];
    const R = this.RG, c0 = R.c0, pt = (i, d, z) => { const a = (R.az0 + i * R.daz) * Math.PI / 180; return [c0[0] + d * Math.sin(a), c0[1] + d * Math.cos(a), z]; };
    // the shore (or, where the bearing runs out to open sea, the horizon) from left to right
    const edge = [];
    R.shore.forEach((d, i) => { if (!d) return; const p = E3.proj(pt(i, d, 0)); if (p[0] > -300 && p[0] < 1400) edge.push(p); });
    edge.sort((p, q) => p[0] - q[0]);
    this.shoreS = edge;
    const B = R11.BOX, far = edge.length ? [[B[0] - 300, edge[0][1]], ...edge, [B[2] + 300, this.hz]] : [[B[0] - 300, this.hz], [B[2] + 300, this.hz]];
    this.waterP = new P(far.concat([[B[2] + 300, B[3] + 300], [B[0] - 300, B[3] + 300]]), true);
    // the coastal strip: from the shore to the foot of the hills (the first ground 25 m up)
    this.plains = []; let pc = null;
    R.shore.forEach((d, i) => {
      const fd = R.foot[i];
      if (!d || !fd) { pc = null; return; }
      const p = E3.proj(pt(i, fd, 25)), q = E3.proj(pt(i, d, 0));
      if (p[0] < -300 || p[0] > 1400) { pc = null; return; }
      if (!pc) { pc = { top: [], foot: [] }; this.plains.push(pc); }
      pc.top.push(p); pc.foot.push(q);
    });
    this.plains = this.plains.filter(c => c.top.length > 1).map(c => { if (c.top[0][0] > c.top[c.top.length - 1][0]) { c.top.reverse(); c.foot.reverse(); } c.poly = new P(c.top.concat(c.foot.slice().reverse()), true); return c; });
    // the ranges, far to near, each from its crest down to the shore
    this.ranges = R.layers.map(lay => {
      const runs = []; let cur = null;
      lay.forEach(([d, z, lc, lb], i) => {
        if (!d || !R.shore[i]) { cur = null; return; }
        const p = E3.proj(pt(i, d, z)), q = E3.proj(pt(i, R.shore[i], 0));
        if (p[0] < -300 || p[0] > 1400) { cur = null; return; }
        const plain = z < 25;
        if (!cur || cur.plain !== plain) { const prev = cur; cur = { top: [], foot: [], lc: [], lb: [], d: [], plain }; runs.push(cur); if (prev) { const n = prev.top.length - 1; cur.top.push(prev.top[n]); cur.foot.push(prev.foot[n]); cur.lc.push(prev.lc[n]); cur.lb.push(prev.lb[n]); cur.d.push(prev.d[n]); } }
        cur.top.push(p); cur.foot.push(q); cur.lc.push(lc); cur.lb.push(lb); cur.d.push(d);
      });
      return runs.filter(c => c.top.length > 1).map(c => {
        if (c.top[0][0] > c.top[c.top.length - 1][0]) ['top', 'foot', 'lc', 'lb', 'd'].forEach(k => c[k].reverse());
        c.poly = new P(c.top.concat(c.foot.slice().reverse()), true); c.crest = new P(c.top);
        c.dm = c.d.reduce((s, x) => s + x, 0) / c.d.length;
        return c;
      });
    });
  },
  // colour: a clear morning sky over the Hajar, deeper overhead; the sea deepening toward the eye
  under(lt) {
    this.frame(lt);
    const B = R11.BOX, hy = this.hz;
    ctx.save(); ctx.beginPath(); R11.boxPath().trace(ctx, 1); ctx.clip();
    washFade([B[0], B[1] - 40, B[2], hy + 4], [[0, HUE.sky, 0.62], [0.55, HUE.sky, 0.42], [1, HUE.cloud, 0.2]], 0, 1);
    washFade([B[0], hy - 30, B[2], B[3]], [[0, HUE.sea, 0.34], [0.22, HUE.sea, 0.46], [0.6, HUE.deep, 0.5], [1, HUE.deep, 0.62]], 0, 1, this.waterP);
    ctx.restore();
  },
  draw(lt) {
    E3.sunAt(106, 28);
    R11.clipped(() => {
      this.frame(lt);
      this.drawSky(lt);
      this.drawRanges(lt);
      this.drawSea(lt);
      const list = [];
      this.breakwater(list, lt);
      this.jetty(list, lt);
      R11.paint(list);
      this.drawShip(lt);
      this.drawInset(lt);
    });
    E3.sunAt();
  },
  // the sky: an engraver's ruling, close and dark overhead, opening toward the clear horizon
  drawSky(lt) {
    const B = R11.BOX, hy = this.hz;
    let y = B[1] + 1.5, k = 0;
    while (y < hy - 2) {
      const u = (y - B[1]) / (hy - B[1]);
      stroke(pl([[B[0], y], [B[2], y]], false, 3100 + k, 0.35), 1, OPT.colour ? HUE.deep : BLUE, 0.7, (OPT.colour ? 0.16 : 0.3) * (1 - 0.8 * u));
      y += 3.2 + 7 * u * u; k++;
    }
  },
  // the Hajar in its computed ranges, far to near: each masks the ranges behind it and stands lighter and bluer the farther
  // it is. Its form is engraved in lines that follow the crest down the range, laid only where the slopes below are turned
  // from the morning sun (the band's own shading from the terrain); the lit faces are left open
  drawRanges(lt) {
    const nL = this.ranges.length;
    for (let k = nL - 1; k >= 0; k--) this.ranges[k].forEach((c, j) => {
      if (c.plain) return; // (the coastal strip is laid over the hills' feet below)
      const a = R11.air(c.dm, 12000), top = c.top, n = top.length;
      mask(c.poly);
      if (OPT.colour) { wash(c.poly, HUE.hill, 0.1 + 0.7 * Math.pow(a, 1.5)); wash(c.poly, HUE.sky, 0.22 * Math.pow(1 - a, 2)); }
      else hatch(c.poly, JT.bbOf(top.concat(c.foot)), -1.05, 4.8 - 1.6 * a, 1, SEPIA, 0.75, 0.1 + 0.32 * a, 5200 + k * 7 + j); // the range's mass, lighter the farther
      const gap = 4.6 - 2.4 * a, N = Math.ceil((16 + 70 * a) / gap), bands = [[], [], [], []], ph = (k * 13 + j * 7) % 11;
      for (let m = 1; m <= N; m++) {
        const off = m * gap, fall = 0.55 + 0.45 * m / N;
        for (let i = 0; i < n - 1; i++) {
          const dk = Math.pow(clamp((0.66 - (c.lb[i] + c.lb[i + 1]) / 2) / 0.42), 1.2), al = (0.12 + 0.88 * dk) * fall * (0.25 + 0.75 * a);
          if (al < 0.08 || c.foot[i][1] - top[i][1] < off) continue;
          const w1 = 0.6 * Math.sin(i * 0.9 + m * 1.7 + ph), w2 = 0.6 * Math.sin((i + 1) * 0.9 + m * 1.7 + ph);
          bands[Math.min(3, Math.floor(al * 4))].push([top[i][0], top[i][1] + off + w1, top[i + 1][0], top[i + 1][1] + off + w2]);
        }
      }
      ctx.save(); ctx.beginPath(); c.poly.trace(ctx, 1); ctx.clip(); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = SEPIA; ctx.lineWidth = 0.5 + 0.35 * a; ctx.lineCap = 'round';
      bands.forEach((g, b) => { if (!g.length) return; ctx.globalAlpha = SA * (b + 0.6) / 4 * (OPT.colour ? 0.62 : 0.85); ctx.beginPath(); g.forEach(q => { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke(); });
      ctx.restore();
      stroke(c.crest, 1, INK, 0.55 + 0.75 * a, 0.2 + 0.6 * a);
    });
    // the coastal strip at the hills' feet: bare, low and far (nothing on it is drawn)
    this.plains.forEach((c, j) => {
      mask(c.poly);
      if (OPT.colour) wash(c.poly, HUE.sand, 0.32);
      hatch(c.poly, JT.bbOf(c.top.concat(c.foot)), 0, 2.4, 1, SEPIA, 0.5, 0.22, 5000 + j);
      stroke(new P(c.top), 1, SEPIA, 0.6, 0.35);
    });
    if (this.shoreS.length > 1) stroke(new P(this.shoreS), 1, INK, 0.8, 0.45);
  },
  // the sea: short strokes lying on the water, darker toward the eye and in the swell's troughs, open on its crests; the
  // basin behind the breakwater calm and light; the hull's reflection and the shadows darker
  drawSea(lt) {
    const wk = TAU / 84, dir = [Math.sin(300 * Math.PI / 180), Math.cos(300 * Math.PI / 180)], om = TAU / 7.4;
    const wk2 = TAU / 23, dir2 = [Math.sin(240 * Math.PI / 180), Math.cos(240 * Math.PI / 180)], om2 = TAU / 3.8;
    const shade = this.shadowPolys(), refl = this.reflPolys(), U = JT.UH, V = JT.VH, { u0, u1 } = this.BW;
    const inAny = (x, y, list) => list.some(q => x >= q.bb[0] && x <= q.bb[2] && y >= q.bb[1] && y <= q.bb[3] && JT.inPoly(x, y, q.p));
    const base = [], calm = [], dark = [], R0 = this.R0;
    this.sea.forEach(([x, y, h, ph, dist]) => {
      const c = E3.proj([x, y, 0]);
      if (c[1] < this.hz - 1 || c[0] < 24 || c[0] > 1096) return;
      const a0 = [x - R0[0] * h, y - R0[1] * h, 0], b0 = [x + R0[0] * h, y + R0[1] * h, 0];
      const lu = x * U[0] + y * U[1], lv = x * V[0] + y * V[1], air = R11.air(dist, 2400);
      if (lv < -170 && lu > u0 - 10 && lu < u1 - 0.14 * (lv + 160) - 14) { calm.push([a0, b0, air * (0.2 + 0.3 * ph)]); return; }
      const sw = 0.5 + 0.5 * Math.cos(wk * (dir[0] * x + dir[1] * y) - om * lt + ph * 0.5), sw2 = 0.5 + 0.5 * Math.cos(wk2 * (dir2[0] * x + dir2[1] * y) - om2 * lt + ph * 2);
      const al = air * (0.1 + 0.9 * Math.pow(sw, 2.2)) * (0.7 + 0.3 * sw2) * (0.85 + 0.3 * ph);
      if (inAny(c[0], c[1], shade)) { dark.push([a0, b0, Math.min(1, al * 1.3 + 0.35)]); return; }
      if (inAny(c[0], c[1], refl)) { dark.push([a0, b0, Math.min(1, al * 1.1 + 0.25)]); return; }
      base.push([a0, b0, al]);
    });
    if (OPT.colour) { shade.forEach(q => wash(new P(q.p, true), HUE.deep, 0.2)); refl.forEach(q => wash(new P(q.p, true), HUE.deep, 0.16)); }
    if (!OPT.colour) { base.forEach(q => { q[2] = Math.min(1, q[2] * 1.3); }); calm.forEach(q => { q[2] *= 1.3; }); }
    JT.segs(base, OPT.colour ? HUE.deep : BLUE, 1);
    JT.segs(calm, OPT.colour ? HUE.deep : BLUE, 0.8);
    JT.segs(dark, INK, 1.1);
  },
  // shadows the morning sun throws on the water (away from it, to the west-north-west): each convex solid's corners
  // carried down the sun's rays to the sea
  shadowPolys() {
    const S = E3.sun(), sh = p => [p[0] - p[2] * S[0] / S[2], p[1] - p[2] * S[1] / S[2], 0], out = [];
    const add = pts => { const sp = JT.hull2(pts.map(p => E3.proj(sh(p)))); if (sp.length > 2) out.push({ p: sp, bb: JT.bbOf(sp) }); };
    const boxPts = D => { const L = JT.L, r = []; [-1, 1].forEach(a => [-1, 1].forEach(b => [D.z0, D.z1].forEach(z => r.push(L(D.u + a * D.hu, D.v + b * D.hv, z))))); return r; };
    this.MD.concat(this.BD, this.WS, [this.PF]).forEach(D => add(boxPts(D)));
    add(boxPts({ u: 0, v: -92.2, hu: 3, hv: 58.9, z0: 7, z1: this.JZ }));
    add(this.deckPts.concat(this.wlPts));
    return out;
  },
  // the dark hull mirrored in the water under her lit side, broken by the swell
  reflPolys() {
    const sp = JT.hull2(this.deckPts.concat(this.wlPts).map(p => E3.proj([p[0], p[1], -p[2] * 0.8])));
    return [{ p: sp, bb: JT.bbOf(sp) }];
  },
  // the breakwater: armour slope, crown wall and crest from its round head to where it turns for the shore, then its trunk
  breakwater(list, lt) {
    const L = JT.L, { u0, u1 } = this.BW, d = R11.dep(L((u0 + u1) / 2, -160, 5));
    list.push({ d: d + 5000, draw: () => {
      const a = R11.air(d, 5000), st = { tone: 0.12, shade: 0.5, lw: 1.1, edgeA: 0.75 * a, fillCol: OPT.colour ? '#A2977F' : null, fillA: 0.42 };
      // the trunk, turning west-north-west for the shore: its crest and the armour of its harbour side, far and light
      const tu = 0.139, tv = -0.990, T = (sd, off, z) => L(u1 + tu * sd - tv * off, -160 + tv * sd + tu * off, z), TL = 2250;
      E3.face([T(0, -12, 9), T(TL, -12, 9), T(TL, -26, 0), T(0, -26, 0)], Object.assign({}, st, { edgeA: 0.5 * a, tone: 0.12 }), 6000);
      E3.face([T(0, 4, 9), T(TL, 4, 9), T(TL, -12, 9), T(0, -12, 9)], Object.assign({}, st, { edgeA: 0.5 * a, n: JT.up, tone: 0.02 }), 6001);
      E3.face([T(0, 4, 9), T(TL, 4, 9), T(TL, 4, 11.5), T(0, 4, 11.5)], Object.assign({}, st, { edgeA: 0.5 * a, tone: 0.05, n: [-JT.VH[0] * 0.47 - JT.UH[0] * 0.883, -JT.VH[1] * 0.47 - JT.UH[1] * 0.883, 0] }), 6002);
      const tsegs = [];
      this.rocks.forEach(([u, t, sz, rot, ph], i) => {
        if (i % 2) return;
        const sd = (u - u0) / (u1 - u0) * TL, off = -12 - 14 * t, dd = R11.dep(T(sd, off, 9 * (1 - t)));
        const al = R11.air(dd, 3000) * (0.3 + 0.3 * ph), aa = rot;
        tsegs.push([T(sd - sz * Math.cos(aa), off, 9 * (1 - t)), T(sd + sz * Math.cos(aa), off - 1.5, 9 * (1 - t) + 0.8), al]);
      });
      E3.segments(tsegs, INK, 0.6);
      // the seaward armour slope, the crown wall and the crest
      const sn = [JT.VH[0] * 0.553, JT.VH[1] * 0.553, 0.833];
      E3.face([L(u0, -139, 0), L(u1, -139, 0), L(u1, -151.5, 8.3), L(u0, -151.5, 8.3)], Object.assign({}, st, { n: sn, tone: 0.1, hdir: JT.along }), 6010);
      E3.face([L(u0, -151.5, 8.3), L(u1, -151.5, 8.3), L(u1, -151.5, 10.8), L(u0, -151.5, 10.8)], Object.assign({}, st, { n: JT.across, tone: 0.02, fillCol: OPT.colour ? '#E8E0CF' : null, fillA: 0.5 }), 6011);
      E3.face([L(u0, -151.5, 10.8), L(u1, -151.5, 10.8), L(u1, -155, 10.8), L(u0, -155, 10.8)], Object.assign({}, st, { n: JT.up, tone: 0 }), 6012);
      E3.face([L(u0, -155, 9), L(u1, -155, 9), L(u1, -168, 9), L(u0, -168, 9)], Object.assign({}, st, { n: JT.up, tone: 0.05 }), 6013);
      // the rock armour: blocks lying on the slope, their shaded lower edges heavier
      const segs = [];
      this.rocks.forEach(([u, t, s, rot, ph]) => {
        const c = L(u, -139 - 12.5 * t, 8.3 * t), dd = R11.dep(c);
        if (dd < 100) return;
        const al = R11.air(dd, 3000) * (0.35 + 0.35 * ph), pts = [];
        for (let m = 0; m < 5; m++) { const aa = rot + m * TAU / 5 + 0.3 * Math.sin(m * 3 + ph * 7), rr = s * (0.6 + 0.4 * Math.abs(Math.sin(m * 1.7 + ph * 5))), tt = clamp(t + rr * Math.sin(aa) / 15); pts.push(L(u + rr * Math.cos(aa), -139 - 12.5 * tt, 8.3 * tt)); }
        for (let m = 0; m < 5; m++) segs.push([pts[m], pts[(m + 1) % 5], al * (m === 2 || m === 3 ? 1 : 0.55)]);
      });
      E3.segments(segs, INK, 0.7);
      // the round head
      const hp = [];
      for (let m = 0; m <= 12; m++) { const aa = m * Math.PI / 12; hp.push([L(u0 - 21 * Math.sin(aa), -160 + 21 * Math.cos(aa), 0), L(u0 - 8 * Math.sin(aa), -160 + 8 * Math.cos(aa), 9)]); }
      for (let m = 0; m < 12; m++) E3.face([hp[m][0], hp[m + 1][0], hp[m + 1][1], hp[m][1]], Object.assign({}, st, { tone: 0.12, edges: false }), 6020 + m);
      E3.line(hp.map(q => q[1]), INK, 0.9, 0.6 * a); E3.line(hp.map(q => q[0]), INK, 0.8, 0.45 * a);
    } });
  },
  // the jetty's parts, each an item for the painter: far first
  jetty(list, lt) {
    const L = JT.L, JZ = this.JZ;
    const concrete = a => ({ tone: 0.04, shade: 0.5, lw: 1.1, edgeA: 0.85 * a, fillCol: OPT.colour ? '#E9E1D0' : null, fillA: 0.45 });
    const piles = (D, n) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
        const pu = D.u + (n === 1 ? 0 : (i / (n - 1) - 0.5) * 1.5 * D.hu), pv = D.v + (j - 0.5) * 1.4 * D.hv;
        this.pile(L(pu, pv, D.z0), L(pu + (pu - D.u) * 0.05, pv + (pv - D.v) * 0.05, -0.3), 1.4);
      }
    };
    // the trestle to the breakwater, on its bents, carrying the two 40-inch lines
    const tv0 = -33.3, tv1 = -151;
    for (let v = -42; v > tv1 + 4; v -= 18) {
      const dv = R11.dep(L(0, v, 5));
      list.push({ d: dv + 1, draw: () => {
        const a = R11.air(dv);
        [-3, 0, 3].forEach(pu => this.pile(L(pu, v, 5.8), L(pu, v, -0.3), 1.2));
        E3.solid(JT.LB(-4, 4, v - 0.7, v + 0.7, 5.8, 7.0), concrete(a), 7000 - v);
      } });
    }
    const dT = R11.dep(L(0, -92, 7));
    list.push({ d: dT - 1, draw: () => {
      const a = R11.air(dT);
      E3.solid(JT.LB(-3, 3, tv1, tv0, 7.0, JZ), concrete(a), 7100);
      [1.1, 2.3].forEach(pu => this.tube(L(pu, tv0, JZ + 0.6), L(pu, tv1 + 2, JZ + 0.6), 1.02, 0.85));
      [-2.9, 2.9].forEach(pu => E3.line([L(pu, tv0, JZ + 1.1), L(pu, tv1, JZ + 1.1)], INK, 0.6, 0.55 * a));
      E3.solid(JT.LB(-5.5, 5.5, tv1 - 5, tv1, 4, JZ + 0.3), concrete(a), 7101);
      // the boat landings beside the trestle's first bent, and their stairs
      [-1, 1].forEach(sg => { E3.solid(JT.LB(Math.min(sg * 4.5, sg * 10), Math.max(sg * 4.5, sg * 10), -46, -40, 1.6, 2.4), concrete(a), 7103 + sg); E3.line([L(sg * 4.2, -41, 2.4), L(sg * 3.1, -48, JZ)], INK, 0.8, 0.6 * a); });
    } });
    // the dolphins
    const dolphin = (D, seed) => {
      const dd = R11.dep(L(D.u, D.v, D.z1));
      list.push({ d: dd, draw: () => {
        const a = R11.air(dd);
        piles(D, D.k[0] === 'W' ? 1 : 3);
        E3.solid(JT.LB(D.u - D.hu, D.u + D.hu, D.v - D.hv, D.v + D.hv, D.z0, D.z1), concrete(a), seed);
        const hk = { tone: 0.35, shade: 0.4, lw: 0.9, edgeA: 0.8 * a, noHatch: true, fillCol: INK, fillA: 0.25 };
        if (D.k[0] === 'M') E3.solid(JT.LB(D.u - 1.8, D.u + 1.8, D.v + D.hv - 1.4, D.v + D.hv - 0.3, D.z1, D.z1 + 0.9), hk, seed + 1); // quadruple quick-release hooks
        if (D.k[0] === 'B') { // the fender: its cone and front panel at the berthing line, a hook for the springs
          E3.solid(JT.LB(D.u - 1.5, D.u + 1.5, -3.2, -0.7, 2.6, 5.6), { tone: 0.5, shade: 0.35, lw: 0.9, edgeA: 0.8 * a }, seed + 2);
          E3.solid(JT.LB(D.u - 2.5, D.u + 2.5, -0.7, 0, 1.2, 7.0), { tone: 0.18, shade: 0.45, lw: 1, edgeA: 0.9 * a }, seed + 3);
          E3.solid(JT.LB(D.u - 1.2, D.u + 1.2, D.v + D.hv - 1.4, D.v + D.hv - 0.3, D.z1, D.z1 + 0.8), hk, seed + 4);
        }
        if (['MD1', 'BD1', 'BD4', 'MD6'].includes(D.k)) { // the navigation beacon masts
          const cu = D.u + (D.u < 0 ? -D.hu + 0.8 : D.hu - 0.8), cv = D.v + D.hv - 0.8;
          this.tube(L(cu, cv, D.z1), L(cu, cv, D.z1 + 8), 0.35, 0.9);
          E3.solid(JT.LB(cu - 0.45, cu + 0.45, cv - 0.45, cv + 0.45, D.z1 + 8, D.z1 + 9.1), { tone: 0.2, shade: 0.4, lw: 0.8, edgeA: 0.85 * a, noHatch: true }, seed + 5);
        }
      } });
    };
    this.MD.forEach((D, i) => dolphin(D, 7200 + i * 10));
    this.BD.forEach((D, i) => dolphin(D, 7300 + i * 10));
    this.WS.forEach((D, i) => dolphin(D, 7400 + i * 10));
    // the walkways
    this.walks.forEach(w => {
      const dd = R11.dep(w.mid);
      list.push({ d: dd - 0.5, draw: () => { const a = R11.air(dd); E3.segments(w.segs.map(([p, q]) => [p, q, 0.72 * a]), INK, clamp(260 / dd, 0.5, 0.9)); } });
    });
    // the loading platform and what stands on it
    const pd = R11.dep(L(0, -18, JZ));
    list.push({ d: pd, draw: () => this.platform(pd) });
    // the mooring lines (the ship's hull, drawn after, hides what runs behind her)
    this.lines.forEach(pts => {
      const dd = R11.dep(pts[12]);
      list.push({ d: dd - 30, draw: () => E3.line(pts, INK, clamp(420 / dd, 0.7, 1.2), 0.9 * R11.air(dd)) });
    });
  },
  platform(pd) {
    const L = JT.L, JZ = this.JZ, D = this.PF, a = R11.air(pd), st = { tone: 0.04, shade: 0.5, lw: 1.1, edgeA: 0.85 * a, fillCol: OPT.colour ? '#E9E1D0' : null, fillA: 0.45 };
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) this.pile(L(-17 + i * 8.5, -6 - j * 12, D.z0), L(-17 + i * 8.5, -6 - j * 12, -0.3), 1.4);
    E3.solid(JT.LB(D.u - D.hu, D.u + D.hu, D.v - D.hv, D.v + D.hv, D.z0, D.z1), st, 7500);
    const items = [];
    // the operator's cabin at the back of the platform
    items.push({ p: L(12.5, -28, JZ + 2), draw: () => {
      E3.solid(JT.LB(8, 17, -31, -25, JZ, JZ + 3.6), { tone: 0.02, shade: 0.45, lw: 1, edgeA: 0.85 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.6 }, 7510);
      E3.face([L(8.6, -25, JZ + 1.6), L(16.4, -25, JZ + 1.6), L(16.4, -25, JZ + 2.8), L(8.6, -25, JZ + 2.8)], { n: JT.across, fillCol: INK, fillA: 0.45, noHatch: true, edges: false }, 7511);
    } });
    // the fire-monitor towers at the back corners, their monitors parked
    [[-17, -30], [17, -31.5]].forEach(([u, v], i) => items.push({ p: L(u, v, JZ + 8), draw: () => this.tower(u, v, JZ, 14, 2.2, 7520 + i * 5, true) }));
    // the gangway tower at the platform's south end
    items.push({ p: L(-15, -7.5, JZ + 8), draw: () => this.tower(-15, -7.5, JZ, 15.5, 3.2, 7540, false) });
    // the risers (their arms are drawn with the ship, over her deck), the header behind them, the two lines to the trestle
    items.push({ p: L(0, -9, JZ + 4), draw: () => {
      this.tube(L(-8, -13, JZ + 0.9), L(8, -13, JZ + 0.9), 1.0, 0.9);
      [1.1, 2.3].forEach(pu => this.tube(L(pu, -13, JZ + 0.6), L(pu, -33.3, JZ + 0.6), 1.02, 0.85));
      this.arms.forEach(A => {
        this.tube(L(A.u, -13, JZ + 0.9), L(A.u, -8.7, JZ + 0.9), 0.5, 0.85);
        E3.solid(JT.LB(A.u - 0.8, A.u + 0.8, -8.8, -7.2, JZ, JZ + 1.1), { tone: 0.2, shade: 0.4, lw: 0.9, edgeA: 0.85 * a, noHatch: true }, 7550 + A.u);
        this.tube(A.foot, A.pivot, 0.75, 0.95);
      });
    } });
    E3.line([L(-19.3, -3.5, JZ + 1.1), L(-19.3, -33.1, JZ + 1.1), L(19.3, -33.1, JZ + 1.1), L(19.3, -3.5, JZ + 1.1)], INK, 0.6, 0.5 * a);
    items.sort((p, q) => R11.dep(q.p) - R11.dep(p.p)).forEach(it => it.draw());
  },
  // a lattice tower (the gangway's, or a fire monitor's), with its head
  tower(u, v, z0, h, w, seed, monitor) {
    const L = JT.L, dd = R11.dep(L(u, v, z0 + h / 2)), a = R11.air(dd), segs = [], c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([p, q]) => [u + p * w / 2, v + q * w / 2]);
    c.forEach(([x, y], i) => { const [x2, y2] = c[(i + 1) % 4]; segs.push([L(x, y, z0), L(x, y, z0 + h), 0.85 * a]); for (let z = z0; z < z0 + h - 0.1; z += 2.6) segs.push([L(x, y, z), L(x2, y2, z + 2.6), 0.55 * a], [L(x, y, z + 2.6), L(x2, y2, z + 2.6), 0.5 * a]); });
    E3.segments(segs, INK, clamp(300 / dd, 0.5, 0.9));
    if (monitor) {
      E3.solid(JT.LB(u - w / 2 - 0.3, u + w / 2 + 0.3, v - w / 2 - 0.3, v + w / 2 + 0.3, z0 + h, z0 + h + 0.4), { tone: 0.1, shade: 0.4, lw: 0.8, edgeA: 0.8 * a, noHatch: true }, seed);
      this.tube(L(u, v, z0 + h + 0.4), L(u, v, z0 + h + 1.3), 0.5, 0.9);
      this.tube(L(u, v, z0 + h + 1.3), L(u, v + 1.4, z0 + h + 0.9), 0.4, 0.9); // parked, its nozzle down
    } else {
      E3.solid(JT.LB(u - w / 2 - 0.4, u + w / 2 + 0.4, v - w / 2 - 0.4, v + w / 2 + 0.4, z0 + h, z0 + h + 2.4), { tone: 0.05, shade: 0.45, lw: 0.9, edgeA: 0.85 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.5 }, seed);
    }
  },
  // a pile standing in the shade under its cap: a dark leg, lit a little down its sunward edge
  pile(a, b, dia) {
    const s = E3.clipSeg(a, b);
    if (!s) return;
    const d = Math.max(1, (E3.depth(a) + E3.depth(b)) / 2), w = dia * this.ec.f / d, air = R11.air(d);
    E3.line([a, b], INK, Math.max(0.6, w), 0.82 * air);
    if (w > 3.5) { const o = w * 0.2; JT.paperLine([[s[0][0] + o, s[0][1]], [s[1][0] + o, s[1][1]]], w * 0.18); }
  },
  // a round member drawn as a cylinder: an inked outline with a paper core once it is wide enough on screen
  tube(a, b, dia, al = 0.9) {
    const s = E3.clipSeg(a, b);
    if (!s) return;
    const d = Math.max(1, (E3.depth(a) + E3.depth(b)) / 2), w = dia * this.ec.f / d, air = R11.air(d);
    if (w < 2.4) { E3.line([a, b], INK, clamp(w, 0.5, 2.4), al * air); return; }
    E3.line([a, b], INK, w, al * air);
    JT.paperLine(s, w - 1.3);
    E3.line([a, b], INK, w * 0.35, 0.16 * air);
  },
  // the ship: hull, forecastle, deck and superstructure, then the arms over her deck
  drawShip(lt) {
    const S = (s, w, z) => this.S(s, w, z), F = this.F, dH = R11.dep(S(165, 0, 7)), a = R11.air(dH);
    const hullSt = { tone: 0.78, shade: 0.35, lw: 1.5, edgeA: 0.95 * a, fillCol: OPT.colour ? '#454C55' : INK, fillA: OPT.colour ? 0.55 : 0.12, hdir: JT.along };
    // her sides are one smooth plate: no seams between the stations, only her waterline and stem where they face the eye
    const C = this.ec.C, vis = [];
    this.hullF.forEach((f, i) => {
      const n = this.hullN(f), c = E3.centroid(f);
      vis.push(n[0] * (C[0] - c[0]) + n[1] * (C[1] - c[1]) + n[2] * (C[2] - c[2]) > 0);
      E3.face(f, Object.assign({}, hullSt, { n, edges: false }), 8000 + i);
    });
    E3.face(this.deckF, { n: JT.up, tone: 0.2, shade: 0.4, lw: 1.3, edgeA: 0.95 * a, fillCol: OPT.colour ? '#B9B6A6' : null, fillA: 0.35, hdir: JT.along }, 8090);
    // the accommodation's and the funnel's shadow on her deck, thrown to the west-north-west by the morning sun
    {
      const Sn = E3.sun(), onDeck = p => [p[0] - (p[2] - F) * Sn[0] / Sn[2], p[1] - (p[2] - F) * Sn[1] / Sn[2], F];
      const corners = (s0, s1, w0, w1, z1) => { const r = []; [s0, s1].forEach(sx => [w0, w1].forEach(wx => { r.push(S(sx, wx, F)); r.push(onDeck(S(sx, wx, z1))); })); return r; };
      const sh = JT.hull2(corners(17, 40, -19, 19, F + 23.4).concat(corners(6.5, 16, -8, 8, F + 34)).map(p => E3.proj(p)));
      ctx.save(); ctx.beginPath(); new P(this.deckF.map(p => E3.proj(p)), true).trace(ctx, 1); ctx.clip();
      const sp = new P(sh, true);
      hatch(sp, JT.bbOf(sh), 0.08, 2.2, 1, INK, 0.6, 0.45, 8091);
      if (OPT.colour) wash(sp, HUE.deep, 0.18);
      ctx.restore();
    }
    const wl = this.wlPts, dk = this.deckPts, nW = wl.length, iStem = this.ST.length - 1;
    for (let i = 0; i < nW; i++) if (vis[i]) {
      const p0 = E3.proj(wl[i]), p1 = E3.proj(wl[(i + 1) % nW]);
      JT.paperLine([[p0[0], p0[1] + 1.6], [p1[0], p1[1] + 1.6]], 1.6);
      E3.line([wl[i], wl[(i + 1) % nW]], INK, 1.3, 0.85 * a);
    }
    if (vis[iStem - 1] !== vis[iStem]) E3.line([wl[iStem], dk[iStem]], INK, 1.3, 0.9 * a);
    // the boot-top: the band from the water to her load line (5.5 m up), her bottom paint, a lighter tone than her sides
    for (let i = 0; i < this.wlPts.length; i++) {
      const j = (i + 1) % this.wlPts.length, p = this.wlPts[i], q = this.wlPts[j], P2 = this.deckPts[i], Q2 = this.deckPts[j], t = 5.5 / F;
      const pm = [lerp(p[0], P2[0], t), lerp(p[1], P2[1], t), 5.5], qm = [lerp(q[0], Q2[0], t), lerp(q[1], Q2[1], t), 5.5];
      E3.face([p, q, qm, pm], { n: this.hullN([p, q, Q2, P2]), tone: 0.5, shade: 0.3, edges: false, hatchCol: INK, hdir: JT.along, fillCol: OPT.colour ? '#6F6A64' : null, fillA: 0.3 }, 8100 + i);
    }
    const rail = []; for (let s = 2; s <= 300; s += 6) rail.push(S(s, this.bd(s), F + 1.1)); E3.line(rail, INK, 0.7, 0.6 * a);
    // deck items, far to near
    const items = [];
    const box = (s0, s1, w0, w1, z0, z1, st, seed) => ({ p: S((s0 + s1) / 2, (w0 + w1) / 2, (z0 + z1) / 2), draw: () => E3.solid(this.SB(s0, s1, w0, w1, z0, z1), st, seed) });
    const white = { tone: 0.0, shade: 0.42, lw: 1.2, edgeA: 0.92 * a, fillCol: OPT.colour ? '#F3EEE2' : null, fillA: 0.55 };
    const steel = { tone: 0.12, shade: 0.45, lw: 1.1, edgeA: 0.9 * a };
    const fwd = this.dirOf(S(1, 0, 0), S(0, 0, 0));
    items.push({ p: S(315, 0, F + 1.6), draw: () => {
      const fc = this.fcsleF, top = fc[0];
      const sides = fc.slice(1, -1);
      sides.forEach((f, i) => E3.face(f, Object.assign({}, hullSt, { n: i === sides.length - 1 ? [JT.UH[0], JT.UH[1], 0] : this.hullN(f), edges: i === sides.length - 1 }), 8200 + i));
      E3.face(top, { n: JT.up, tone: 0.2, shade: 0.4, lw: 1.3, edgeA: 0.95 * a, fillCol: OPT.colour ? '#B9B6A6' : null, fillA: 0.35, hdir: JT.along }, 8219);
      // the anchors stowed in their pockets on each bow, just under the deck edge, lying on the flared plating (a point dz
      // below the deck edge at deck station s lies on the loft's line from that station down to its waterline station)
      [-1, 1].forEach(sg => {
        const at = (s, dz) => { const [ws, wb] = this.wlAt(s), t = Math.max(0, dz) / F; return S(lerp(s, ws, t), sg * (lerp(this.bd(s), wb, t) + 0.08), F - dz); };
        const pk = [at(313.5, 0.8), at(318.5, 0.8), at(318.5, -2.2), at(313.5, -2.2)];
        E3.face(pk, { n: this.hullN([at(312, 7), at(320, 7), at(320, 0), at(312, 0)]), fillCol: INK, fillA: 0.6, noHatch: true, lw: 0.9, edgeA: 0.85 * a }, 8095 + sg);
        E3.line([at(316, 0.4), at(316, -1.8)], INK, 1.2, 0.8 * a);
      });
    } });
    // the accommodation aft: the engine casing, six decks, the wheelhouse and its wings, the funnel, an A-frame mast
    items.push(box(4, 17, -12, 12, F, F + 12, steel, 8210));
    items.push({ p: S(28, 0, F + 10), draw: () => {
      E3.solid(this.SB(17, 40, -19, 19, F, F + 20), white, 8220);
      const win = [];
      for (let dk = 0; dk < 6; dk++) {
        const z = F + 1.4 + dk * 3.3;
        for (let k = 0; k < 11; k++) { const w0 = -16.5 + k * 3.1; win.push([[S(40.02, w0, z), S(40.02, w0 + 1.5, z), S(40.02, w0 + 1.5, z + 1.2), S(40.02, w0, z + 1.2)], fwd]); }
        for (let k = 0; k < 6; k++) { const s0 = 19.5 + k * 3.4; win.push([[S(s0, 19.02, z), S(s0 + 1.5, 19.02, z), S(s0 + 1.5, 19.02, z + 1.2), S(s0, 19.02, z + 1.2)], JT.across]); }
      }
      win.forEach(([f, n], i) => E3.face(f, { n, fillCol: INK, fillA: 0.42, noHatch: true, edges: false }, 8230 + i));
      for (let dk = 1; dk < 6; dk++) { const z = F + dk * 3.3; E3.line([S(40.05, -19, z), S(40.05, 19, z), S(17, 19.05, z)], INK, 0.6, 0.45 * a); }
      E3.solid(this.SB(29, 40, -21, 21, F + 20, F + 23.4), white, 8240);
      E3.solid(this.SB(36.5, 40, -30, 30, F + 20, F + 20.9), white, 8241);
      E3.face([S(40.03, -20.5, F + 21.3), S(40.03, 20.5, F + 21.3), S(40.03, 20.5, F + 22.8), S(40.03, -20.5, F + 22.8)], { n: fwd, fillCol: INK, fillA: 0.6, noHatch: true, edges: false }, 8242);
      R11.member(S(33, -3, F + 23.4), S(33, 0, F + 31), 1.6, 0.9); R11.member(S(33, 3, F + 23.4), S(33, 0, F + 31), 1.6, 0.9);
      E3.solid(this.SB(32.2, 33.8, -2.2, 2.2, F + 31, F + 31.8), steel, 8243);
    } });
    items.push({ p: S(11, 0, F + 24), draw: () => {
      E3.solid(E3.frustum(6.5, 16, -8, 8, F + 12, F + 34, -0.8, -0.8).map(f => f.map(q => this.S(q[0], q[1], q[2]))).concat([[this.S(6.5, -8, F + 34), this.S(16, -8, F + 34), this.S(16, 8, F + 34), this.S(6.5, 8, F + 34)]]), { tone: 0.16, shade: 0.45, lw: 1.2, edgeA: 0.9 * a, fillCol: OPT.colour ? '#E4DED0' : null, fillA: 0.5 }, 8250);
      E3.line([S(6.5, -8, F + 32.8), S(16, -8, F + 32.8), S(16, 8, F + 32.8)], INK, 0.6, 0.5 * a);
      [-2.5, 2.5].forEach(w => this.tube(S(10.5, w, F + 34), S(10.5, w, F + 35.8), 1.1, 0.9));
    } });
    // a free-fall lifeboat on its ramp at the stern
    items.push({ p: S(3, 0, F + 13), draw: () => {
      const bt = [S(1, -1.6, F + 12.2), S(9.5, -1.6, F + 14.3), S(9.5, 1.6, F + 14.3), S(1, 1.6, F + 12.2)], tp = bt.map(p => [p[0], p[1], p[2] + 2.4]);
      E3.solid([bt, tp].concat([0, 1, 2, 3].map(k => [bt[k], bt[(k + 1) % 4], tp[(k + 1) % 4], tp[k]])), { tone: 0.05, shade: 0.4, lw: 0.9, edgeA: 0.85 * a, noHatch: true, fillCol: OCHRE, fillA: 0.55 }, 8260);
    } });
    // the fore-and-aft pipe run and catwalk on the centreline, the manifold across her midships, two hose cranes
    items.push({ p: S(170, 0, F + 1), draw: () => {
      const segs = [];
      [-1.6, -0.5, 0.6, 1.6].forEach(w => segs.push([S(44, w, F + 0.8), S(298, w, F + 0.8), 0.8 * a]));
      [-0.8, 0.8].forEach(w => segs.push([S(44, w, F + 2.9), S(298, w, F + 2.9), 0.75 * a]));
      for (let s = 48; s < 298; s += 9) segs.push([S(s, -0.8, F), S(s, -0.8, F + 2.9), 0.5 * a], [S(s, 0.8, F), S(s, 0.8, F + 2.9), 0.5 * a]);
      for (let s = 52; s < 290; s += 21) [-13, -7, 7, 13].forEach(w => segs.push([S(s, w, F + 0.7), S(s + 1.6, w, F + 0.7), 0.7 * a], [S(s, w, F), S(s, w, F + 0.7), 0.5 * a]));
      segs.push([S(44, 4.2, F + 1.4), S(296, 4.2, F + 1.4), 0.8 * a], [S(44, 5.2, F + 1.4), S(296, 5.2, F + 1.4), 0.5 * a]);
      [-26.5, 26.5].forEach(w => segs.push([S(40, w, F + 0.6), S(300, w * this.bd(300) / 30, F + 0.6), 0.55 * a]));
      for (let s = 60; s < 290; s += 30) [4.2, -1.6].forEach(w => segs.push([S(s, w, F), S(s, w, F + 1.4), 0.5 * a]));
      E3.segments(segs, INK, 0.8);
      [6, 2, -2, -6].forEach(du => { const s = 165 + du; this.tube(S(s, -25.4, F + 1.5), S(s, 25.4, F + 1.5), 0.45, 0.9); [-25.4, 25.4].forEach(w => this.tube(S(s, w, F + 1.5), S(s, w, F + 2.1), 0.45, 0.9)); });
      E3.solid(this.SB(156, 174, -29, -24, F, F + 1.0), steel, 8270);
      E3.solid(this.SB(156, 174, 24, 29, F, F + 1.0), steel, 8271);
      [[150, -22, 140, -12], [180, 22, 196, 14]].forEach(([s, w, s2, w2]) => { this.tube(S(s, w, F), S(s, w, F + 6.5), 1.4, 0.9); this.tube(S(s, w, F + 6.2), S(s2, w2, F + 9.5), 0.55, 0.9); });
    } });
    // mooring winches fore and aft, the foremast
    [[310, -9], [310, 9], [318, -6], [318, 6]].forEach(([s, w], i) => items.push(box(s - 1.5, s + 1.5, w - 1.3, w + 1.3, F + this.FC, F + this.FC + 1.6, steel, 8280 + i)));
    [[46, -18], [46, 18], [50, -10], [50, 10]].forEach(([s, w], i) => items.push(box(s - 1.5, s + 1.5, w - 1.3, w + 1.3, F, F + 1.6, steel, 8290 + i)));
    items.push({ p: S(321, 0, F + 10), draw: () => this.tube(S(321, 0, F + this.FC), S(321, 0, F + this.FC + 13), 0.7, 0.9) });
    // the loading arms and the gangway, reaching from the platform over her rail
    items.push({ p: S(165, -34, F + 12), draw: () => this.drawArms() });
    items.sort((p, q) => R11.dep(q.p) - R11.dep(p.p)).forEach(it => it.draw());
  },
  // a hull face's outward normal: its own plane (Newell), turned away from her centreline at the face's station
  hullN(f) {
    const n = [0, 0, 0];
    for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    const l = Math.hypot(n[0], n[1], n[2]) || 1, c = E3.centroid(f), U = JT.UH, V = JT.VH;
    const cu = c[0] * U[0] + c[1] * U[1], cv = c[0] * V[0] + c[1] * V[1], m = JT.L(cu, 30, c[2]);
    let out = [c[0] - m[0], c[1] - m[1], 0];
    if (Math.hypot(out[0], out[1]) < 1) out = [U[0] * Math.sign(cu), U[1] * Math.sign(cu), 0]; // the transom
    const sg = n[0] * out[0] + n[1] * out[1] >= 0 ? 1 : -1;
    return [sg * n[0] / l, sg * n[1] / l, sg * n[2] / l];
  },
  dirOf(a, b) { const v = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; },
  drawArms() {
    const L = JT.L;
    this.arms.forEach((A, i) => {
      const a = R11.air(R11.dep(A.apex)), st = { tone: 0.3, shade: 0.4, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: INK, fillA: 0.3 };
      this.tube(A.tail, A.apex, 0.62, 0.95);
      this.tube(A.lever, A.lever2, 0.18, 0.9);
      this.tube(A.pivot, A.cw2, 0.3, 0.9);
      E3.solid(A.cw, st, 8400 + i); E3.solid(A.cwb, st, 8410 + i);
      this.tube(A.apex, A.swiv, 0.62, 0.95);
      this.tube(A.swiv, A.elbow, 0.45, 0.95);
      this.tube(A.elbow, A.flange, 0.5, 0.95);
    });
    // the gangway from its tower's head down to her deck
    const g0 = L(-15, -7.5, this.JZ + 16.2), g1 = L(-15, 3.2, this.F + 1.2), g0b = L(-13.8, -7.5, this.JZ + 16.2), g1b = L(-13.8, 3.2, this.F + 1.2);
    const segs = [[g0, g1, 0.9], [g0b, g1b, 0.9]];
    for (let t = 0.1; t < 1; t += 0.12) segs.push([[0, 1, 2].map(i => lerp(g0[i], g1[i], t)), [0, 1, 2].map(i => lerp(g0b[i], g1b[i], t)), 0.6]);
    E3.segments(segs, INK, 0.8);
  },
  // the east-coast bulletin: the draft writes itself line by line from 0.4 s after the cut, and the forecaster signs it
  // 3.4 s in, as the narrator says so
  drawInset(lt) {
    const iq = easeOut(prog(lt, 0.2, 0.5));
    if (iq <= 0) return;
    mask(this.sheet); fill(this.sheet, SEPIA, 0.05 * iq); stroke(this.sheet, iq, INK, 1.4); stroke(this.sheetIn, iq, INK, 0.7, 0.6);
    if (OPT.colour) { wash(this.chartSeaA, HUE.sea, 0.35 * iq); wash(this.chartLandA, HUE.sand, 0.35 * iq); }
    stroke(this.chartBox, iq, INK, 0.8, 0.6);
    this.chartSea.forEach(p => stroke(p, iq, BLUE, 0.9, 0.5));
    stroke(this.coast, iq, INK, 1.4, 0.85);
    this.textLines.forEach((l, j) => { const wq = clamp((lt - 1.4 - j * 0.17) / 0.3); if (wq > 0) stroke(new P([[l.x, l.y], [l.x + l.w * wq, l.y]]), 1, INK, 1.2, 0.6); });
    stroke(this.sign, easeInOut(prog(lt, 4.4, 0.7)), BLUE, 1.6, 0.9);
  },
});
