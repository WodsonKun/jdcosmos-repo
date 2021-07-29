const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(require("express-useragent").express());

// Load stuff used by Just Dance in general
const AliasDB = require("./cosmos-database/v1/cosmos-aliasdb.json");
const ItemDB = require("./cosmos-database/v1/cosmos-itemdb.json");
const AvatarDB = require("./cosmos-database/v1/cosmos-avatardb.json");
const LocaleID = require("./cosmos-database/v1/cosmos-localeid.json");

// Carousel
const PCPartyCar = require("./cosmos-database/v1/carousel/pc-cmos-partycar.json");

// Playlists (for Just Dance 2019)
const PlaylistDB = require("./cosmos-database/v1/cosmos-playlistdb.json");
const PlaylistCar = require("./cosmos-database/v1/carousel/con-cmos-playlistcar.json");

// Quest Mode
const QuestDB = require("./cosmos-database/v1/cosmos-questdb.json");
const QuestCar = require("./cosmos-database/v1/carousel/all-cmos-questcar.json");

// Add support for PC
const PCSongDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");
const PCPackages = require("./cosmos-database/v1/packages/pc-cmos-packages.json");

// World Dance Floor (uses 2021's World Dance Floor servers)
var room = "EasyMainJD2021";
const RoomPC = require("./cosmos-functions/v1/wdf/screens.json");
const WDFBosses = require("./cosmos-functions/v1/wdf/online-bosses.json");
const RoomAssign = require("./cosmos-functions/v1/wdf/assign-room.json");
const ServerTime = require("./cosmos-functions/v1/wdf/server-time.json");

// V1, V2 and V3
const v1 = require("./cosmos-server/v1/configuration.json");
const v2 = require("./cosmos-server/v2/entities.json");
const v3 = require("./cosmos-server/v3/users/1b5f3c8c-4072-4d13-af9e-f47d7a6e8021.json");

/// Other functions
// Pages
const HomeTiles = require("./cosmos-functions/v1/pages/home/tiles.json");
const CarouselPackages = require("./cosmos-functions/v1/pages/carousel/packages.json");
const UpsellVideos = require("./cosmos-functions/v1/pages/upsell-videos.json");

// Others
var CMOSToken = "xbl3.0 x=13133567362984495105;eyJlbmMiOiJBMTI4Q0JDK0hTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJ4NXQiOiJIczVfRXFrQTdJdzJpU2lrRmRSanpGd2ZRUFkifQ.fmXcORdK6gbAsrujCA0lKjFSNz47YyFMHP-Upc7grDNg78qoxtH18hR4Wg8NrTekd8sITb73ii26_KO9jIUsIVskCItoibFgPiAwbqLuFoOtjkC8JarqofE-BSG401kuZEbVGShG8Ss1_tn8ZLmxCk-B1rkMvHXMN6orq3RiU1aPF-PVBNTpr4e9SMPHhoEpWaH9jAf6uuuHP5Nm1NapEQqTLcIsUg5nHHGbhl5nw9o5jUYZ8ewyvKaUWGly1AK3a1vEXEJ5LS6vkvPDKnCl36e4PVdXnPIF2v6dKaSDqnL8LTJsRbKPoj9Fr_t27bU_yT6OTFGAmXJikiFNhbZIUw.5O5iVv_CQE1kr16UdY-HYA.geHia7lHZBiq-hKtGLVntua9fNYfz-CSYDBkSTuzbUV6e3kN9r_uKJoDzZhamf1R5hgKm7Tl9MYlFVN-PcG9C5ieZRq08jCivqTFm42xb86OrNcQl4TkzJIcvCCcLOJzfZTwd-3dt9DktpQCjvb2X2fI_AjbFuxfjBZiT090cI8eB9zMg5JoPk5aMd8F0ENIKA_1RNMGOX2hX5g11_iyIYcVA4mudt9q7OYf3kMIljmVx-sUTf5pA8npyiv79cvOSejJccWp8d4-nGF6y4wddTNahpae7bKcJ6XCJ09MtnGaqnrY917iJq6NBmXD6wYFQUPQoVJZ4vimU1FywCJSl7PMugbDFRAwhrjAwg_U6KcxH27YnrhsrXBA9TEswhvntF2av0q6ycpFbZsBelejTavbu_HY6tpfu9x80j-fUjHy5Wu2e6r3JDaYXbd1gt-xkeRF3MiGp3KnW1c_WvX4fJexKyafXp6ANpRr2rNl5GipLc9PlqwMEjv3ghCZ4Dd0D0pVzBPcsbbx919sBjJSOoI3wK8GXghCMwy_SMLcC47hwQry08jYE1rXi5igU_EQLtx1zyr7RzTvmmvWvRBrdPMFz2sXVVYsS3UOMHbXwJRnDZOV5kD-3Rn6EpkDTxu_ZAR4vk4TP818407Dbt5Q3x4DkTzCz-6p_wVICOyOY2yHO6cpPp4ErBtg-iCqcoG-uzDr4BK3bRn362QbwyWvBX0TOJEwZ2Xh7myw1jACnl3QoR8gvpqymLorAUYBdLvkJsGb4Jj1DEIZe9AAbF6fUysr4bIBpF-eQovTE4vqjMy17sPzmXWFXWo5PKcC0DdcM4UMryMSPGEAIStl5pOmTfVMPEuDSX4cBlzXB6Omd5JUUwmTHBtf3Rb-fgQAgxU8THdw-a5_yVB7Xr_7HpKPWhI3FFphxAWCsyVS2u-wemhHJ_oqwavG_xIcmUyZZc6PgVFgTvtc4u_c66eevkP4sYmQPQ2LwcLMMihECUHKl3d2BiENl7crjIfI68Tex2o1sN0e5Ye6tDIGXFQzYbGDOpv_ArglgYZyciigmJoT5bJ6DziE274ZNMW1id2PStHYiZVcUbLOybzCECtVTBYXVB_VpeR1_Xb47IimVEcSDIao892Z5OzzBEQTxFjdKy6n1vdI0--tgCne8Zu_Geeahcq9nyp8uRlUsHXOaVIGHCLFrrKq4GxuAIoLbdrCUn6GqTQlHrmAA4qpu1gYI5EPQYZOkJ5KApIqfvUhwprdoEViZNvCLADU1fffYoxeYEBijhvJWc1gWAhOEqenaEu0O4JoEuFQtXt9klitUBrZQL9FRXAqBHqfGpsWNj_oUXMcyb7MGRxGyOrfBhLh_SbOMlzOnOPQUsIqXSvIURIPFgZpU0LWGrj1BPYVG_qdM26hb89ybGIV_2aqox8SQrv-cd5ggeLgl1WdDF8PkbpIYlwxLmyPhUNzeKqbMQRL7BGxhXMqHEJHbYE5fdY3QW5WB7cwesUss1Z6n4N5h8AUCXhiKB7N_Mld5lWQBxMVJAabzqIMDM0om7z1N_UYHEoZfA._TNAcCKpZVg2r5kjemyPxwF1yCKCOQxQRj_5y6i-0Rk"
const DM = require("./cosmos-functions/v1/blocks.json");
const COM = require("./cosmos-functions/v1/com-videos-fullscreen.json");
const Ping = require("./cosmos-functions/v1/ping.json");
const SubsUpdate = require("./cosmos-functions/v1/subscription.json");
const SKUConstants = require("./cosmos-functions/v1/sku-constants.json");
const { request } = require("express");

// Just Dance Cosmos's core
var cosmos = {
    interactiveconfig: {
        playerseason: {
            isseasonactive: false,
            seasonnumber: 1,
            seasonname: "",
            seasonplaylist: [""]
        },
        /*wdfoverwrite: {
            wdfoverwriteenabled: false,
            wdfoverwritehappyhour: '{"__class":"HappyHoursInfo","start":1615651200,"end":1615653000,"running":false}',
            wdfoverwritelist: ["BlackWidow", "Finesse"]
        },*/
		playlists: {
			recommendedbydev: ["AllYouGottaCHN", "Intoxicated", "HeadAndHeart", "Disturbia"],
            newsongs: ["AllYouGottaCHN", "JDCDrinkingSong", "Think"],
            extremes: ["24KALT", "AnimalsALT", "BadGuyALT", "FeelSpecialALT"],
            china: ["AllYouGottaCHN", "BigBowlThickNoodle", "BigBowlThickNoodleALT", "JDCChickChick", "JDCCoolestEthnic","JDCDrinkingSong", "JDCGee"],
            communityremixes: ["BreakFreeCMU", "SingleLadiesCMU"],
            mashups: ["StargateMU"]
		}
    },
    core: {
        requestcheck: function (request) {
            if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static") {
                if (request.header("X-SkuId") == "jdex-cmos-pc" ||
                request.header("X-SkuId") == "jd2017-cmos-pc")
                {
                    return true
                }
            }
            else
            {
                    return 403;
            }
        },
        getskuid: function (request) {
            return request.header("X-SkuId")
        }
    },
    carouselcore: {
        returncatalog: () => {
            party = require("./cosmos-database/v1/carousel/pcbeta-cmos-carousel.json")
			// add categories to all
			
			party.categories.forEach(function(carousel){
				// add all the songs to the jdconnect catagory
				if (carousel.title == "Just Dance Cosmos") {
					for (var songs in PCSongDB) {
						song = PCSongDB[songs]
						var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
						if (cosmos.carousel.ifsongpublic(song.mapName) == true) { carousel.items.push(obj) }
					}
				}
				
				// Add songs in their games' categories
				for (var songs in PCSongDB) {
						song = PCSongDB[songs]
					if (carousel.title == "Just Dance " + song.originalJDVersion) {
						var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
						if (cosmos.carousel.ifsongpublic(song.mapName) == true) { carousel.items.push(obj) }
					}
				}
			});
			
            coop = JSON.parse(JSON.stringify(party))
            sweat = JSON.parse(JSON.stringify(party))
            search = JSON.parse(JSON.stringify(party))
			
			// switch actionlist for coop and sweat
			coop.actionLists.coopMap = coop.actionLists.partyMap
			coop.actionLists.sweatMap = coop.actionLists.partyMap
			
			// remove search for coop and sweat
			coop.categories.forEach(function(carousel){ 
				if(carousel.title == "[icon:SEARCH_FILTER] Search") {
					delete carousel
				}
			})
			sweat.categories.forEach(function(carousel){ 
				if(carousel.title == "[icon:SEARCH_FILTER] Search") {
					delete carousel
				}
			})
			
			// add search result to search
			var current = 0
			var splice = 0
			search.categories.forEach(function(carousel){ 
				if(carousel.title == "[icon:SEARCH_FILTER] Search") {
				} else {
					current = current + 1
				}
			});
			var obj = JSON.parse('{ "__class": "Category", "title": "[icon:SEARCH_RESULT] insert search result here", "items": [], "isc": "grp_row", "act": "ui_carousel" }')
			search.categories.splice(current + 1,0,obj)
			
    }
    },
}

/* Makes security checks
app.use((req, res, next) => {
    if (cosmos.core.requestcheck(req) == true) {
        return next();
    } else {
        return res.send(cosmos.core.requestcheck(req));
    }
})*/

app.post("/carousel/v2/pages/party", (request, response) => {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.body.searchString == "" || request.body.searchString == undefined) {
            if (request.body.searchString == "") {
                response.send(party);
            } else {
                response.send("DDOS someone else next time. - JDConnect Engineers")
            }
        } else {
            var songdb = PCSongDB;
            var query = request.body.searchString.toString().toUpperCase();
            console.log(query + " is searched");

            var matches = [];
            for (var song in songdb) {
                // skip loop if the property is from prototype

                var obj = songdb[song];

                var title = obj.title.toString().toUpperCase();
                var artist = obj.artist.toString().toUpperCase();
                var mapname = obj.mapName.toString().toUpperCase();
                var jdversion = obj.originalJDVersion.toString();
                var jdversion2 = "JUST DANCE " + obj.originalJDVersion.toString();
                var jdversion3 = "JD" + obj.originalJDVersion.toString();

                if (
                    title.includes(query) == true ||
                    jdversion.includes(query) == true ||
                    jdversion2.includes(query) == true ||
                    jdversion3.includes(query) == true ||
                    artist.includes(query) == true ||
                    mapname.includes(query) == true) {
                    matches.push(obj.mapName.toString());
                }
            }

            var carresponse = null;
			carresponse =  JSON.parse(JSON.stringify(search))
            
			carresponse.categories.forEach(function(carousel) {
				if (carousel.title == "[icon:SEARCH_RESULT] insert search result here") {
					carousel.title = "[icon:SEARCH_RESULT] " + request.body.searchString.toString();
					matches.forEach(function (arrayItem) {
						var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + arrayItem + '"}],"actionList":"partyMap"}');
						carousel.items.push(obj);
					});
				}
			})
            
            response.send(carresponse);
        }
    } else {
        response.sendStatus(cosmos.core.requestcheck(request));
    }
});

// Playlists
app.get("/playlistdb/v1/playlists", function (request, response) {
    response.send(PlaylistDB);
});
app.post("/carousel/v2/pages/jd2019-playlists", (request, response) => {
    response.send(PlaylistCar);
});

// SKU Packages
app.get("/packages/:version/sku-packages", function (request, response) {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static") {
            if (request.header("X-SkuId") == "jdex-cmos-pc" ||
            request.header("X-SkuId") == "jd2017-cmos-pc")
            {
                response.send(PCPackages)
            }
        }
    }
});

// SongDBs
app.get("/songdb/:version/songs", function (request, response) {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static") {
            if (request.header("X-SkuId") == "jdex-cmos-pc" ||
            request.header("X-SkuId") == "jd2017-cmos-pc")
            {
            response.send(PCSongDB)
            }
        }
    }
});

// LocaleIDs
app.get("/songdb/v1/localisation", function(request, response) {
    response.send(LocaleID);
});

// Quests
app.get("/questdb/v1/quests", function(request, response) {
    response.send(QuestDB);
});
app.get("/session-quest/v1/", function (request, response) {
    response.send('{ "__class": "SessionQuestService::QuestData", "newReleases": [] }');
});
app.post("/carousel/v2/pages/quests", function (request, response) {
    response.send(QuestCar);
});

// Aliases
app.get("/aliasdb/v1/aliases", function (request, response) {
    response.send(AliasDB);
});

// Home Tiles
app.post("/home/v1/tiles", function (request, response) {
    response.send(HomeTiles);
});

// Avatars
app.post("/carousel/v2/pages/avatars", function(request, response) {
    response.send(AvatarDB);
});

// Dancercard / Friend Dancercard
app.post("/carousel/v2/pages/dancerprofile", (req, res) => {
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/carousel/v2/pages/dancerprofile",
        method: "POST",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        "Accept-Language": "en-us,en",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, req.body, function(redResponse) {
        res.send(redResponse);
    });
});

app.post("/carousel/v2/pages/friend-dancerprofile", (req, res) => {
    var json = JSON.stringify(req.body);
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/carousel/v2/pages/friend-dancerprofile?pid=" + req.query.pid,
        method: "POST",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        "Accept-Language": "en-us,en",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, json, function(redResponse) {
        res.send(redResponse);
    });
});
  
app.get("/status/v1/ping", function(request, response) {
    response.send(Ping);
});

app.get("/com-video/v1/com-videos-fullscreen", function(request, response) {
    response.send(COM);
});

app.get("/constant-provider/v1/sku-constants", (req, res) => {
    res.send(SKUConstants);
});

app.post("/carousel/v2/pages/upsell-videos", function(request, response) {
    response.send(UpsellVideos);
});

app.post("/subscription/v1/refresh", function(request, response) {
    response.send(SubsUpdate);
});

// No HUDs (optimized)
app.get('/content-authorization/v1/maps/:map', function(request, response) {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.params.map) {
            var path = "./cosmos-database/v1/content-authorization/"
            if (fs.existsSync(path + request.params.map + ".json")) {
                fs.readFile(path + request.params.map + ".json", function(err, data) {
                    if (err) throw err;
                    if (data) {
                        var strdata = JSON.parse(data),
                            pardata = JSON.stringify(strdata);
                        response.send(pardata)
                    }
                })
            }
            else {
                response.send("Forbidden")
            }
        }
    }
  });

// Favorites
app.put("/profile/v2/favorites/maps/:map", function (req, res) {
    var auth = req.header("Authorization");
    var json = JSON.stringify(req.body);
    const httpsopts = {
      hostname: "prod.just-dance.com",
      port: 443,
      path: "/profile/v2/favorites/maps/" + req.params.map,
      method: "PUT",
      headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
      }
    };
    redirect(httpsopts, json, function(redResponse) {
      res.send(redResponse);
      console.log(redResponse);
    });
  });
  
app.delete("/profile/v2/favorites/maps/:map", (req, res) => {
    var auth = req.header("Authorization");
    var json = JSON.stringify(req.body);
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/profile/v2/favorites/maps/" + req.params.map,
        method: "DELETE",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        "Accept-Language": "en-us,en",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, json, function(redResponse) {
        res.send(redResponse);
        console.log(redResponse);
    });
});

// Community Remix (ded)
app.get("/community-remix/v1/active-contest", (request, response) => {
	var auth = request.header("Authorization");
	const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/community-remix/v1/active-contest",
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "X-SkuId": "jd2017-pc-ww"
    }
  };
  redirect(httpsopts, "", function(redResponse) {
    response.send(redResponse);
  });
});

// Leaderboards
app.get("/leaderboard/v1/maps/:map", (req, res) => {
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/leaderboard/v1/maps/" + req.params.map,
        method: "GET",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function(redResponse) {
        var responsepar = JSON.parse(redResponse);
        res.send(responsepar);
    });
});
  
app.get("/leaderboard/v1/maps/:map/dancer-of-the-week", (req, res) => {
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/leaderboard/v1/maps/" + req.params.map + "/dancer-of-the-week",
        method: "GET",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function(redResponse) {
        res.send(redResponse);
    });
});
  
app.post("/leaderboard/v1/maps/:map", (req, res) => {
    var auth = req.header("Authorization");
    var json = JSON.stringify(req.body);
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/leaderboard/v1/maps/" + req.params.map,
        method: "POST",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        "Accept-Language": "en-us,en",
        Authorization: auth,
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, json, function(redResponse) {
        res.send(redResponse);
    });
});
  
app.get("/leaderboard/v1/coop_points/mine", (req, res) => {
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/leaderboard/v1/coop_points/mine",
        method: "GET",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function(redResponse) {
        res.send(redResponse);
    });
});

// Country (required)
var requestCountry = require("request-country");
app.get("/profile/v2/country", function (request, response) {
    var country = requestCountry(request);
    if (country == false) {
        country = "TR";
    }
    response.send('{ "country": "' + country + '" }');
});

// Filter Players (???)
app.post("/profile/v2/filter-players", function (request, response) {
    response.send(
        '["00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000","00000000-0000-0000-0000-000000000000"]');
});

// v1
app.get("/v1/applications/341789d4-b41f-4f40-ac79-e2bc4c94ead4/configuration", function(request, response) {
    response.send(v1);
});

// v2
app.get("/v2/spaces/f1ae5b84-db7c-481e-9867-861cf1852dc8/entities", function(request, response) {
    response.send(v2);
});


app.get("/profile/v2/profiles", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
      hostname: 'prod.just-dance.com',
      port: 443,
      path: '/profile/v2/profiles?profileIds=' + req.query.profileIds,
      method: 'GET',
      headers: {
        'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
        'Accept': '*/*',
        'Authorization': auth,
        'Content-Type': 'application/json',
        'X-SkuId': 'jd2017-pc-ww'
      }
    }
    redirect(httpsopts, '', function(redResponse){
        res.send(redResponse)
      console.log(redResponse);
    })
  })
  app.post("/profile/v2/profiles", function(req, res){
    res.redirect(307, "https://prod.just-dance.com/profile/v2/profiles")
});

// v3
app.get("/v3/users/:user", (req, res) => {
    var auth = req.header("Authorization");
    var sessionid = req.header("Ubi-SessionId");
    const httpsopts = {
        hostname: "public-ubiservices.ubi.com",
        port: 443,
        path: "/v3/users/" + req.params.user,
        method: "GET",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "ubi-appbuildid": "BUILDID_259645",
        "Ubi-AppId": "341789d4-b41f-4f40-ac79-e2bc4c94ead4",
        "Ubi-localeCode": "en-us",
        "Ubi-Populations": "US_EMPTY_VALUE",
        "Ubi-SessionId": sessionid
        }
    };
    redirect(httpsopts, "", function(redResponse) {
        res.send(redResponse);
        console.log(redResponse);
    });
});
  
app.post("/v3/users/:user", (req, res) => {
    var auth = req.header("Authorization");
    var sessionid = req.header("Ubi-SessionId");
    const httpsopts = {
        hostname: "public-ubiservices.ubi.com",
        port: 443,
        path: "/v3/users/" + req.params.user,
        method: "GET",
        headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "ubi-appbuildid": "BUILDID_259645",
        "Ubi-AppId": "341789d4-b41f-4f40-ac79-e2bc4c94ead4",
        "Ubi-localeCode": "en-us",
        "Ubi-Populations": "US_EMPTY_VALUE",
        "Ubi-SessionId": sessionid
        }
    };
    redirect(httpsopts, "", function(redResponse) {
        res.send(redResponse);
        console.log(redResponse);
    });
});

// v3/profiles/sessions
app.post("/v3/profiles/sessions", (req, res) => {
    var json = JSON.stringify({});
    var auth = req.header("Authorization");
    const httpsopts = {
      hostname: "public-ubiservices.ubi.com",
      port: 443,
      path: "/v3/profiles/sessions",
      method: "POST",
      headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "ubi-appbuildid": "BUILDID_259645",
        "Ubi-AppId": "740a6dc8-7d7a-4fbe-be2c-aa5d8c65c5e8",
        "Ubi-localeCode": "en-us",
        "Ubi-Populations": "US_EMPTY_VALUE"
      }
    };
    redirect(httpsopts, json, function(redResponse) {
      var responsepar = JSON.parse(redResponse);
      res.send(responsepar);
    });
  });
  
// Function to redirect to other domains
// An OPTIONS is necessary to contain route details, GET/POST and the direction
function redirect(options, write, callback) {
    var Redirect = https.request(options, response => {
        response.on("data", data => {
        callback(data);
        });
    });
    Redirect.on("error", e => {
        console.log(e);
    });
    Redirect.write(write);
    Redirect.end();
    }

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
});  

//Add statistics to the server
function addStats(codename) {
    fs.readFile("./cosmos-stats/played-songs/alltime.json", "utf-8", function(err, data) {
      if (err) throw err;
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects[codename] = arrayOfObjects[codename] + 1;
      fs.writeFile("./cosmos-stats/played-songs/alltime.json", JSON.stringify(arrayOfObjects), "utf-8", function(err) {
          if (err) throw err;
          console.log("All-time stats of " + codename + " changed");
        }
      );
    });
    fs.readFile("./cosmos-stats/played-songs/total.json", "utf-8", function(err, data) {
      if (err) throw err;
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects["total"] = arrayOfObjects["total"] + 1;
      fs.writeFile("./cosmos-stats/played-songs/total.json", JSON.stringify(arrayOfObjects), "utf-8", function(err) {
          if (err) throw err;
          console.log("Total stats of " + codename + " changed");
        }
      );
    });
  }
  