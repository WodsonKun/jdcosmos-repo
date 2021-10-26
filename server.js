/// Just Dance Cosmos
// v2 (Build 5)

// Lastest addition: Map BKG for Just Dance EX, Banner BKG for Just Dance 2017
// Next addition: Search function, automatized playlist for New and Top 20

const express = require("express");
const fs = require("fs");
const path = require('path');
const https = require("https");
const app = express();
app.use(express.json());
app.use(express.static("public"));

///Set variables and local paths for files
// Songs
const SKUPackages = require("./cosmos-database/v1/packages/pc-cmos-skupkg.json");
const LocaleID = require("./cosmos-database/v1/cosmos-localeid.json");

// Avatars
const Avatars = require("./cosmos-database/v1/cosmos-avatardb.json");

// Quest carousel
const QJSONCarousel = require("./cosmos-database/v1/carousel/pages/all-cmos-questcar.json");

// Just Dance EX carousels
const EXJSONCarousel = require("./cosmos-database/v1/carousel/ex-cmos-partycar.json");

// Database
const SongDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");
const QuestDB = require("./cosmos-database/v1/cosmos-questdb.json");
const ItemDB = require("./cosmos-database/v1/cosmos-itemdb.json");

//WDF
const WDF = require("./cosmos-functions/v1/wdf/assign-room.json");
const RoomPC = require("./cosmos-functions/v1/wdf/screens.json");
const Time = require("./cosmos-functions/v1/wdf/server-time.json");
const Bosses = require("./cosmos-functions/v1/wdf/online-bosses.json");

// V1, V2 and V3
const v1 = require("./cosmos-server/v1/configuration.json");
const v2 = require("./cosmos-server/v2/entities.json");
const v3 = require("./cosmos-server/v3/users/1b5f3c8c-4072-4d13-af9e-f47d7a6e8021.json");

// Others
const DM = require("./cosmos-functions/v1/blocks.json");
const SKUConstants = require("./cosmos-functions/v1/sku-constants.json");
const Ping = require("./cosmos-functions/v1/ping.json");
const COM = require("./cosmos-functions/v1/com-videos-fullscreen.json");
const Pages = require("./cosmos-functions/v1/pages/upsell-videos.json");
const CarouselPackages = require("./cosmos-functions/v1/pages/carousel/packages.json");
const Subs = require("./cosmos-functions/v1/subscription.json");

// Define "search" variable
var search;

// Customizable core
var carouselcore = {
    interactiveconfig: {
        playerseason: {
            isseasonactive: false,
            seasonname: "",
            seasonplaylist: [""]
        },
        playlists: {
            newsongs: ["ComeBackHome", "JDCDrinkingSong", "TheWayIAre", "Think", "Tightrope"],
            top20playlist: []
        }
    }
}

// SKU Packages
app.get("/packages/v1/sku-packages", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        response.send(SKUPackages);
        break;
    case "jd2017-pc-ww":
        response.send(SKUPackages);
        break;
    default:
        response.send("Hey there!" + "\n" + "Cosmos's SKU Packages (otherwise known as mainscenes) aren't currently unavaliable for public use");
        break;
    }
});

// Database
app.get("/songdb/v1/songs", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        // Set the variables to SongDB and Carousel
        var OnlineDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");

        for (var song in OnlineDB) {
            var obj = OnlineDB[song];
			if (obj.assets["map_bkgImageUrl"] == null || 
			obj.assets["map_bkgImageUrl"] == "" ||
			obj.assets["map_bkgImageUrl"] == undefined){
				obj.assets["banner_bkgImageUrl"] = obj.assets["banner_bkgImageUrl"];
			}
			else {
				obj.assets["banner_bkgImageUrl"] = obj.assets["map_bkgImageUrl"];
			}
        }
        return response.send(OnlineDB);
        break;
    case "jd2017-pc-ww":
        response.send(SongDB);
        break;
    default:
        response.send("Hey there!" + "\n" + "Cosmos's SongDB are currently unavaliable through a browser");
        break;
    }
});

app.get("/questdb/v1/quests", function (request, response) {
    response.send(QuestDB);
});
app.get("/customizable-itemdb/v1/items", function (request, response) {
    response.send(ItemDB);
});

app.get("/songdb/v1/localisation", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        response.send(LocaleID);
        break;
    case "jd2017-pc-ww":
        response.send(LocaleID);
        break;
    default:
        response.send("Hey there!" + "\n" + "Really? Even the LocaleID file? Obviously you know that you can't get it");
        break;
    }
});

app.get("/dance-machine/v1/blocks", function (request, response) {
    response.send(DM);
});

// Carousel
/// Quest carousel
app.post("/carousel/v2/pages/quests", function (request, response) {
    response.send(QJSONCarousel);
});

/// New carousel code
app.post("/carousel/v2/pages/party", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        // Set the variables to SongDB and Carousel
        var OnlineDB = JSON.parse(JSON.stringify(require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")));
        var OnlineCarousel = JSON.parse(JSON.stringify(require("./cosmos-database/v1/carousel/ex-cmos-partycar.json")));

        // Define the carousel as a function
        OnlineCarousel.categories.forEach(function (carousel) {

            // Add all the songs onto Just Dance Cosmos category
            if (carousel.title == "Just Dance Cosmos") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                    carousel.items.push(obj);
                }
            }

            // Playlist for New Songs
            if (carousel.title == "[icon:PLAYLIST] New songs in Just Dance Cosmos") {
                carouselcore.interactiveconfig.playlists.newsongs.forEach(function (song) {
                    var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song + '"}],"actionList":"partyMap"}');
                    carousel.items.push(obj)
                })
            }

            // Add Just Dance songs onto it's own category
            if (carousel.title == "Just Dance") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 1) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add songs in their game categories (excl. ABBA, East and Kids)
            for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                    if (carousel.title == "Just Dance " + song.originalJDVersion) {
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj)
                    }
            }

            // Add ABBA: You Can Dance songs onto it's own category
            if (carousel.title == "ABBA: You Can Dance") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 4884) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add Just Dance China and Japan songs onto it's own category
            if (carousel.title == "Just Dance East") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 4514) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add Just Dance China / Japan songs onto it's own category
            if (carousel.title == "Just Dance Kids") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 123) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }
        });

        if (request.body.searchString == "" || request.body.searchString == undefined) {
            response.send(OnlineCarousel);
        } else {
            search = JSON.parse(JSON.stringify(require("./cosmos-database/v1/carousel/ex-cmos-partycar.json")));

            // add search result to search
            var current = 0
                var splice = 0
                search.categories.forEach(function (carousel) {
                    if (carousel.title == "[icon:SEARCH_FILTER] Search") {}
                    else {
                        current = current + 1
                    }
                });
            var obj = JSON.parse('{ "__class": "Category", "title": "[icon:SEARCH_RESULT] insert search result here", "items": [], "isc": "grp_row", "act": "ui_carousel" }')
                search.categories.splice(current + 1, 0, obj)

                var CarouselDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");
            var query = request.body.searchString.toString().toUpperCase();

            var matches = [];
            for (var song in CarouselDB) {

                var obj = CarouselDB[song];

                var title = obj.title.toString().toUpperCase();
                var artist = obj.artist.toString().toUpperCase();
                var mapname = obj.mapName.toString().toUpperCase();
                var jdversion = obj.originalJDVersion.toString();
                var jdversion2 = "JUST DANCE " + obj.originalJDVersion.toString();
                var jdversion3 = "JD" + obj.originalJDVersion.toString();

                if (title.includes(query) == true ||
                    jdversion.includes(query) == true ||
                    jdversion2.includes(query) == true ||
                    jdversion3.includes(query) == true ||
                    artist.includes(query) == true ||
                    mapname.includes(query) == true) {
                    matches.push(obj.mapName.toString());
                }
            }

            var carresponse = search;
            carresponse.categories.forEach(function (carousel) {

                // Add all the songs onto Just Dance Cosmos category
                if (carousel.title == "Just Dance Cosmos") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj);
                    }
                }

                // Playlist for New Songs
                if (carousel.title == "[icon:PLAYLIST] New songs in Just Dance Cosmos") {
                    carouselcore.interactiveconfig.playlists.newsongs.forEach(function (song) {
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj)
                    })
                }

                // Add Just Dance songs onto it's own category
                if (carousel.title == "Just Dance") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 1) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add songs in their game categories (excl. ABBA, East and Kids)
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (carousel.title == "Just Dance " + song.originalJDVersion) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj)
                        }
                }

                // Add ABBA: You Can Dance songs onto it's own category
                if (carousel.title == "ABBA: You Can Dance") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 4884) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add Just Dance China and Japan songs onto it's own category
                if (carousel.title == "Just Dance East") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 4514) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add Just Dance China / Japan songs onto it's own category
                if (carousel.title == "Just Dance Kids") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 123) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

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
        break;
    case "jd2017-pc-ww":
        // Set the variables to SongDB and Carousel
        var OnlineDB = JSON.parse(JSON.stringify(require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")));
        var OnlineCarousel = JSON.parse(JSON.stringify(require("./cosmos-database/v1/carousel/ex-cmos-partycar.json")));

        // Define the carousel as a function
        OnlineCarousel.categories.forEach(function (carousel) {

            // Add all the songs onto Just Dance Cosmos category
            if (carousel.title == "Just Dance Cosmos") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                    carousel.items.push(obj);
                }
            }

            // Playlist for New Songs
            if (carousel.title == "[icon:PLAYLIST] New songs in Just Dance Cosmos") {
                carouselcore.interactiveconfig.playlists.newsongs.forEach(function (song) {
                    var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song + '"}],"actionList":"partyMap"}');
                    carousel.items.push(obj)
                })
            }

            // Add Just Dance songs onto it's own category
            if (carousel.title == "Just Dance") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 1) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add songs in their game categories (excl. ABBA, East and Kids)
            for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                    if (carousel.title == "Just Dance " + song.originalJDVersion) {
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj)
                    }
            }

            // Add ABBA: You Can Dance songs onto it's own category
            if (carousel.title == "ABBA: You Can Dance") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 4884) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add Just Dance China and Japan songs onto it's own category
            if (carousel.title == "Just Dance East") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 4514) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }

            // Add Just Dance China / Japan songs onto it's own category
            if (carousel.title == "Just Dance Kids") {
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (song.originalJDVersion == 123) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj);
                        }
                }
            }
        });

        if (request.body.searchString == "" || request.body.searchString == undefined) {
            response.send(OnlineCarousel);
        } else {
            search = JSON.parse(JSON.stringify(require("./cosmos-database/v1/carousel/ex-cmos-partycar.json")));

            // add search result to search
            var current = 0
                var splice = 0
                search.categories.forEach(function (carousel) {
                    if (carousel.title == "[icon:SEARCH_FILTER] Search") {}
                    else {
                        current = current + 1
                    }
                });
            var obj = JSON.parse('{ "__class": "Category", "title": "[icon:SEARCH_RESULT] insert search result here", "items": [], "isc": "grp_row", "act": "ui_carousel" }')
                search.categories.splice(current + 1, 0, obj)

                var CarouselDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");
            var query = request.body.searchString.toString().toUpperCase();

            var matches = [];
            for (var song in CarouselDB) {

                var obj = CarouselDB[song];

                var title = obj.title.toString().toUpperCase();
                var artist = obj.artist.toString().toUpperCase();
                var mapname = obj.mapName.toString().toUpperCase();
                var jdversion = obj.originalJDVersion.toString();
                var jdversion2 = "JUST DANCE " + obj.originalJDVersion.toString();
                var jdversion3 = "JD" + obj.originalJDVersion.toString();

                if (title.includes(query) == true ||
                    jdversion.includes(query) == true ||
                    jdversion2.includes(query) == true ||
                    jdversion3.includes(query) == true ||
                    artist.includes(query) == true ||
                    mapname.includes(query) == true) {
                    matches.push(obj.mapName.toString());
                }
            }

            var carresponse = search;
            carresponse.categories.forEach(function (carousel) {

                // Add all the songs onto Just Dance Cosmos category
                if (carousel.title == "Just Dance Cosmos") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj);
                    }
                }

                // Playlist for New Songs
                if (carousel.title == "[icon:PLAYLIST] New songs in Just Dance Cosmos") {
                    carouselcore.interactiveconfig.playlists.newsongs.forEach(function (song) {
                        var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song + '"}],"actionList":"partyMap"}');
                        carousel.items.push(obj)
                    })
                }

                // Add Just Dance songs onto it's own category
                if (carousel.title == "Just Dance") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 1) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add songs in their game categories (excl. ABBA, East and Kids)
                for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                    var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                        if (carousel.title == "Just Dance " + song.originalJDVersion) {
                            var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                            carousel.items.push(obj)
                        }
                }

                // Add ABBA: You Can Dance songs onto it's own category
                if (carousel.title == "ABBA: You Can Dance") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 4884) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add Just Dance China and Japan songs onto it's own category
                if (carousel.title == "Just Dance East") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 4514) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

                // Add Just Dance China / Japan songs onto it's own category
                if (carousel.title == "Just Dance Kids") {
                    for (var songs in require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")) {
                        var song = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json")[songs]
                            if (song.originalJDVersion == 123) {
                                var obj = JSON.parse('{"__class":"Item","isc":"grp_cover","act":"ui_component_base","components":[{"__class":"JD_CarouselContentComponent_Song","mapName":"' + song.mapName + '"}],"actionList":"partyMap"}');
                                carousel.items.push(obj);
                            }
                    }
                }

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
        break;
    default:
        response.send("Hey there!" + "\n" + "It's just a carousel, get serious");
        break;
    }
});

/// Just Dance / Dance Quest's Co-op carousel
app.post("/carousel/v2/pages/partycoop", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        response.send(EXJSONCarousel);
        break;
    case "jd2017-pc-ww":
        response.send(EXJSONCarousel);
        break;
    default:
        response.send("Hey there!" + "\n" + "It's just a carousel, get serious");
        break;
    }
});

/// Sweat & Playlists carousel
app.post("/carousel/v2/pages/sweat", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        response.send(EXJSONCarousel);
        break;
    case "jd2017-pc-ww":
        response.send(EXJSONCarousel);
        break;
    default:
        response.send("Hey there!" + "\n" + "It's just a carousel, get serious");
        break;
    }
});

// Avatars
app.post("/carousel/v2/pages/avatars", function (request, response) {
    response.send(Avatars);
});

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
    redirect(httpsopts, req.body, function (redResponse) {
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
    redirect(httpsopts, json, function (redResponse) {
        res.send(redResponse);
    });
});

app.get("/status/v1/ping", function (request, response) {
    response.send(Ping);
});

app.get("/com-video/v1/com-videos-fullscreen", function (request, response) {
    response.send(COM);
});

app.get("/constant-provider/v1/sku-constants", (req, res) => {
    res.send(SKUConstants);
});

app.post("/carousel/v2/pages/upsell-videos", function (request, response) {
    response.send(Pages);
});

app.post("/subscription/v1/refresh", function (request, response) {
    response.send(Subs);
});

// No HUDs (optimized)
app.get("/content-authorization/v1/maps/:map", function (request, response) {
    const skuId = request.header("X-SkuId");
    switch (skuId) {
    case "jdex-pc-cmos":
        if (request.params.map) {
            var path = "./cosmos-database/v1/content-authorization/"
                if (fs.existsSync(path + request.params.map + ".json")) {
                    fs.readFile(path + request.params.map + ".json", function (err, data) {
                        if (err)
                            throw err;
                        if (data) {
                            var strdata = JSON.parse(data),
                            pardata = JSON.stringify(strdata);
                            response.send(pardata)
                        }
                    })
                } else {
                    response.send("Forbidden")
                }
        }
        break;
    case "jd2017-pc-ww":
        if (request.params.map) {
            var path = "./cosmos-database/v1/content-authorization/"
                if (fs.existsSync(path + request.params.map + ".json")) {
                    fs.readFile(path + request.params.map + ".json", function (err, data) {
                        if (err)
                            throw err;
                        if (data) {
                            var strdata = JSON.parse(data),
                            pardata = JSON.stringify(strdata);
                            response.send(pardata)
                        }
                    })
                } else {
                    response.send("Forbidden")
                }
        }
        break;
    default:
        response.send("Hey there!" + "\n" + "We spent a real good time getting all of those No HUDs... So, is a no go");
        break;
    }
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
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
        console.log(redResponse);
    })
})
app.post("/profile/v2/profiles", function (req, res) {
    res.redirect(307, "https://prod.just-dance.com/profile/v2/profiles")
    console.log(res);
})

app.get("/profile/v2/favorites/maps/:map", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/profile/v2/favorites/maps/' + req.params.map,
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Authorization': auth,
            'Content-Type': 'application/json',
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})

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
    redirect(httpsopts, json, function (redResponse) {
        res.send(redResponse);
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
    redirect(httpsopts, json, function (redResponse) {
        res.send(redResponse);
        console.log(redResponse);
    });
});

// v1
app.get("/v1/applications/:game/configuration", function (request, response) {
    if (jdconnect.core.requestcheck(request) == true) {
        response.send(v1);
    } else {
        response.sendStatus(jdconnect.core.requestcheck(request));
    }
});

// v2
app.get("/v2/spaces/:spaceid/entities", function (request, response) {
    if (jdconnect.core.requestcheck(request) == true) {
        response.send(v2);
    } else {
        response.sendStatus(jdconnect.core.requestcheck(request));
    }
});

app.post("/profile/v2/filter-players", (request, response) => {
    var json = JSON.stringify(request.body);
    const httpsopts = {
        hostname: "public-ubiservices.ubi.com",
        port: 443,
        path: "/v2/profiles/sessions",
        method: "POST",
        headers: {
            "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19022",
            Authorization: require("./DATABASE/ubiticket.json").AuthXBOX,
            "Content-Type": "application/json",
            "Ubi-AppId": "7df3c817-cde1-4bf9-9b37-ceb9d06c4b96",
            Host: "public-ubiservices.ubi.com",
            "Content-Length": "0"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        var responsepar = JSON.parse(redResponse);
        var auth = "Ubi_v1 " + responsepar["ticket"];
        const httpsopts2 = {
            hostname: "prod.just-dance.com",
            port: 443,
            path: "/profile/v2/filter-players",
            method: "POST",
            headers: {
                Accept: "*/*",
                Authorization: auth,
                "Content-Type": "application/json",
                "X-SkuId": "jd2020-xone-all"
            }
        };
        redirect(httpsopts2, json, function (redResponse) {
            response.send(JSON.parse(redResponse));
        });
    });
});

var requestCountry = require("request-country");
app.get("/profile/v2/country", function (request, response) {
    var country = requestCountry(request);
    if (country == false) {
        country = "TR";
    }
    response.send('{ "country": "' + country + '" }');
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
    redirect(httpsopts, "", function (redResponse) {
        res.send(JSON.parse(redResponse));
    });
});

app.post("/v3/users/:user", (req, res) => {
    var json = JSON.stringify(req.body);
    const httpsopts = {
        hostname: "public-ubiservices.ubi.com",
        port: 443,
        path: "/v2/profiles/sessions",
        method: "POST",
        headers: {
            "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19022",
            Authorization: require("./DATABASE/ubiticket.json").AuthXBOX,
            "Content-Type": "application/json",
            "Ubi-AppId": "155d58d0-94ae-4de2-b8f9-64ed5f299545",
            Host: "public-ubiservices.ubi.com",
            "Content-Length": "0"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        var responsepar = JSON.parse(redResponse);
        var auth = "Ubi_v1 " + responsepar["ticket"];
        const httpsopts2 = {
            hostname: "prod.just-dance.com",
            port: 443,
            path: "/v3/users/" + req.params.user,
            method: "POST",
            headers: {
                Accept: "*/*",
                Authorization: auth,
                "Content-Type": "application/json",
                "X-SkuId": "jd2017-xone-emea"
            }
        };
        redirect(httpsopts2, json, function (redResponse) {
            res.send(JSON.parse(redResponse));
        });
    });
});

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
    redirect(httpsopts, "", function (redResponse) {
        var responsepar = JSON.parse(JSON.stringify(redResponse));
        res.send(responsepar);
        console.log(responsepar)
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
    redirect(httpsopts, "", function (redResponse) {
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
    redirect(httpsopts, json, function (redResponse) {
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
    redirect(httpsopts, "", function (redResponse) {
        res.send(redResponse);
    });
});

// Packages
app.post("/carousel/v2/packages", function (request, response) {
    response.send(CarouselPackages);
});

/// Session Quest (???)
app.get("/session-quest/v1/", function (request, response) {
    response.send(
        '{ "__class": "SessionQuestService::QuestData", "newReleases": [] }');
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

// World Dance Floor
app.post("/wdf/v1/assign-room", (request, response) => {
    var json = JSON.stringify({
        "playGlobally": 1
    });
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/assign-room",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/server-time", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/server-time",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/online-bosses", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/online-bosses",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/ccu", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/ccu",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/newsfeed", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/newsfeed",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/next-happyhours", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/next-happyhours",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/notification", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/notification",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.post("/wdf/v1/rooms/PCJD2017/screens", (request, response) => {
    var json = JSON.stringify(request.body);
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/screens",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.post("/wdf/v1/rooms/PCJD2017/session", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/session",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.delete("/wdf/v1/rooms/PCJD2017/session", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/session",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/themes/boss/score-recap", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/boss/score-recap",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/themes/boss/score-status", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/boss/score-status",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.post("/wdf/v1/rooms/PCJD2017/themes/vote/update-score", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/vote/update-score",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.post("/wdf/v1/rooms/PCJD2017/themes/vote/choice", (request, response) => {
    var json = JSON.stringify({
        "voteOption": '"' + response.params.map + '"'
    });
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/vote/choice",
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
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/themes/vote/result", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/vote/result",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

app.get("/wdf/v1/rooms/PCJD2017/themes/vote/score-recap", (request, response) => {
    var auth = request.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/wdf/v1/rooms/PCJD2017/themes/vote/score-recap",
        method: "GET",
        headers: {
            "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
            Accept: "*/*",
            "Accept-Language": "en-us,en",
            Authorization: auth,
            "X-SkuId": "jd2017-pc-ww"
        }
    };
    redirect(httpsopts, "", function (redResponse) {
        response.send(redResponse);
    });
});

// v3/profiles/sessions
app.post("/v3/*", (req, res) => {
    var reqheaders = Object.assign({}, req.headers);
    reqheaders["host"] = "public-ubiservices.ubi.com"
    axios.post("https://public-ubiservices.ubi.com/" + req.url, JSON.stringify(req.body), {
        headers: reqheaders
    })
    .then(response => {
        res.send(response.data)
    })
    .catch(err => {
        res.send(err)
        console.log("Sessions Report: An request have failed: " + err)
    })
});
app.delete("/v3/*", (req, res) => {
    var reqheaders = Object.assign({}, req.headers);
    reqheaders["host"] = "public-ubiservices.ubi.com"
    axios.delete("https://public-ubiservices.ubi.com/" + req.url, JSON.stringify(req.body), {
        headers: reqheaders
    })
    .then(response => {
        res.send(response.data)
    })
    .catch(err => {
        res.send(err)
        console.log("Sessions Report: An request have failed: " + err)
    })
});
app.get("/v3/*", (req, res) => {
    var reqheaders = Object.assign({}, req.headers);
    reqheaders["host"] = "public-ubiservices.ubi.com"
    axios.get("https://public-ubiservices.ubi.com/" + req.url, JSON.stringify(req.body), {
        headers: reqheaders
    })
    .then(response => {
        res.send(response.data)
    })
    .catch(err => {
        res.send(err)
        console.log("Sessions Report: An request have failed: " + err)
    })
});

var requestCountry = require("request-country");
app.all("*", (req, res) => {
    transactiondate = new Date().toISOString();
    transactionid = uuid();
    fullurl = req.protocol + "://" + req.get("host") + req.originalUrl;
    res.send(
        '<pre>{"errorCode":1003,"message":"Resource ' +
        req.url +
        ' not found.","httpCode":404,"errorContext":"' + req.method + '","moreInfo":"A link to more information will be coming soon. Please contact AleMService for more support.","transactionTime":"' +
        transactiondate +
        '","transactionId":"' +
        transactionid +
        '"}</pre>');
    console.log(req.url + " is not found (" + req.method + ")");
    console.log("transactionid: " + transactionid);
    console.log("transactiondate: " + transactiondate);
    console.log("useragent: " + req.header("User-Agent"));
    console.log("country: " + requestCountry(req));
});

// Connected App

var bodyParser = require('body-parser');
connectedapp.use(bodyParser.json());
connectedapp.use(bodyParser.urlencoded({ extended: false }));
connectedapp.use(express.static('AleMService'))

connectedapp.post("/v1/createaccount", (req,res) => {
        var queryinfo = JSON.stringify('{"query": { accountuplayusername: "' + req.query.nameOnPlatform + '"}')
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("jdconnect");
            let query = function() {
                return dbo.collection("users").findOne(JSON.parse(queryinfo).query);
            }
            var letquery = query()
            letquery.then(function(result) {
                //if (result.accountuplayusername !== undefined) {
                    //res.sendStatus(401)
                //} else {  
                    jdconnect.Connecteddb.CreateAccount('{"uplayusername": "' + req.query.nameOnPlatform + '"}')
                    res.sendStatus(200)
                //}
                db.close();
            })
        });
})
connectedapp.post("/v1/updateaccount", (req,res) => {
    jdconnect.Connecteddb.UpdateAccount(JSON.stringify(req.body))
    res.sendStatus(200)
})
connectedapp.post("/v1/getaccountinf", (req,res) => {
    jdconnect.Connecteddb.GetAccountInf(JSON.stringify(req.body))
})

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
const listener = app.listen(process.env.PORT, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
