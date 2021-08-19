const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Set variables for XMLHTTP requests
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var prodwsurl = "https://prod.just-dance.com";

///Set variables and local paths for files
// Songs
const SKUPackages = require("./packages/sku-packages.json");
const LocaleID = require("./songdb/localisation.json");

// Avatars
const Avatars = require('./carousel/pages/avatars.json');

//Carousel
const QJSONCarousel = require("./carousel/pages/aa-quests.json");
const PJSONCarousel = require("./carousel/party-carousel.json");

//Database
const SongDB = require("./songdb/songs.json");
const QuestDB = require("./questdb/quests.json");
const ItemDB = require("./customizable-itemdb/items.json");

//WDF
const WDF = require("./wdf/v1/assign-room.json");
const RoomPC = require("./wdf/v1/rooms/PCJD2017/screens.json");
const Time = require("./wdf/v1/server-time.json");
const Bosses = require("./wdf/v1/online-bosses.json");
const Newsfeed = require("./wdf/v1/rooms/PCJD2017/newsfeed.json");
const Notification = require("./wdf/v1/rooms/PCJD2017/notification.json");
const CCU = require("./wdf/v1/rooms/PCJD2017/ccu.json");

// V1, V2 and V3
const v1 = require("./v1/configuration.json");
const v2 = require("./v2/entities.json");
const v3 = require("./v3/users/1b5f3c8c-4072-4d13-af9e-f47d7a6e8021.json");

// Others
const DM = require("./data/dm/blocks.json");
const SKUConstants = require("./constant-provider/v1/sku-constants.json");
const Ping = require("./data/ping.json");
const COM = require("./com-video/com-videos-fullscreen.json");
const Pages = require("./carousel/pages/upsell-videos.json");
const CarouselPackages = require("./carousel/packages.json");
const Subs = require("./subscription/v1/refresh.json");

// SKU Packages
app.get("/packages/v1/sku-packages", function (request, response) {
    response.send(SKUPackages);
});

// Database
app.get("/songdb/v1/songs", function (request, response) {
    response.send(SongDB);
});
app.get("/questdb/v1/quests", function (request, response) {
    response.send(QuestDB);
});
app.get("/customizable-itemdb/v1/items", function (request, response) {
    response.send(ItemDB);
});
app.get("/songdb/v1/localisation", function (request, response) {
    response.send(LocaleID);
});

app.get("/dance-machine/v1/blocks", function (request, response) {
    response.send(DM);
});

app.post("/carousel/v2/pages/quests", function (request, response) {
    response.send(QJSONCarousel);
});

app.post("/carousel/v2/pages/party", function (request, response) {
    response.send(PJSONCarousel);
});

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

app.get("/content-authorization/v1/maps/:map", function (request, response) {
    if (request.params.map) {
        var path_JD = "./content-authorization/v1/maps/JD/";
        var path_JD2 = "./content-authorization/v1/maps/JD2/";
        var path_JD3 = "./content-authorization/v1/maps/JD3/";
        var path_JD4 = "./content-authorization/v1/maps/JD4/";
        var path_JD2014 = "./content-authorization/v1/maps/JD2014/";
        var path_JD2015 = "./content-authorization/v1/maps/JD2015/";
        var path_JD2016 = "./content-authorization/v1/maps/JD2016/";
        var path_JD2017 = "./content-authorization/v1/maps/JD2017/";
        var path_JD2018 = "./content-authorization/v1/maps/JD2018/";
        var path_JD2019 = "./content-authorization/v1/maps/JD2019/";
        var path_JD2020 = "./content-authorization/v1/maps/JD2020/";
        var path_JD2021 = "./content-authorization/v1/maps/JD2021/";
        var path_JDABBA = "./content-authorization/v1/maps/JDABBA/";
        var path_JDCHINA = "./content-authorization/v1/maps/JDCHINA/";
        var path_JDKIDS = "./content-authorization/v1/maps/JDKIDS/";
        var path_JDWIIU = "./content-authorization/v1/maps/JDWIIU/";
        if (fs.existsSync(path_JD + request.params.map + ".json")) {
            fs.readFile(path_JD + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2 + request.params.map + ".json")) {
            fs.readFile(path_JD2 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD3 + request.params.map + ".json")) {
            fs.readFile(path_JD3 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD4 + request.params.map + ".json")) {
            fs.readFile(path_JD4 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2014 + request.params.map + ".json")) {
            fs.readFile(path_JD2014 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2015 + request.params.map + ".json")) {
            fs.readFile(path_JD2015 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2016 + request.params.map + ".json")) {
            fs.readFile(path_JD2016 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2017 + request.params.map + ".json")) {
            fs.readFile(path_JD2017 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2018 + request.params.map + ".json")) {
            fs.readFile(path_JD2018 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2019 + request.params.map + ".json")) {
            fs.readFile(path_JD2019 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2020 + request.params.map + ".json")) {
            fs.readFile(path_JD2020 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JD2021 + request.params.map + ".json")) {
            fs.readFile(path_JD2021 + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JDABBA + request.params.map + ".json")) {
            fs.readFile(path_JDABBA + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JDCHINA + request.params.map + ".json")) {
            fs.readFile(path_JDCHINA + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JDKIDS + request.params.map + ".json")) {
            fs.readFile(path_JDKIDS + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else if (fs.existsSync(path_JDWIIU + request.params.map + ".json")) {
            fs.readFile(path_JDWIIU + request.params.map + ".json", function (err, data) {
                if (err)
                    throw err;
                if (data) {
                    var strdata = JSON.parse(data),
                    pardata = JSON.stringify(strdata);
                    response.send(pardata);
                    addStats(request.params.map);
                }
            });
        } else {
            var json = JSON.stringify({});
            const httpsopts = {
                hostname: "public-ubiservices.ubi.com",
                port: 443,
                path: "/v2/profiles/sessions",
                method: "POST",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19022",
                    // Change token to one that works for JDU
                    "Authorization": "xbl3.0 x=13133567362984495105;eyJlbmMiOiJBMTI4Q0JDK0hTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJ4NXQiOiJIczVfRXFrQTdJdzJpU2lrRmRSanpGd2ZRUFkifQ.fmXcORdK6gbAsrujCA0lKjFSNz47YyFMHP-Upc7grDNg78qoxtH18hR4Wg8NrTekd8sITb73ii26_KO9jIUsIVskCItoibFgPiAwbqLuFoOtjkC8JarqofE-BSG401kuZEbVGShG8Ss1_tn8ZLmxCk-B1rkMvHXMN6orq3RiU1aPF-PVBNTpr4e9SMPHhoEpWaH9jAf6uuuHP5Nm1NapEQqTLcIsUg5nHHGbhl5nw9o5jUYZ8ewyvKaUWGly1AK3a1vEXEJ5LS6vkvPDKnCl36e4PVdXnPIF2v6dKaSDqnL8LTJsRbKPoj9Fr_t27bU_yT6OTFGAmXJikiFNhbZIUw.5O5iVv_CQE1kr16UdY-HYA.geHia7lHZBiq-hKtGLVntua9fNYfz-CSYDBkSTuzbUV6e3kN9r_uKJoDzZhamf1R5hgKm7Tl9MYlFVN-PcG9C5ieZRq08jCivqTFm42xb86OrNcQl4TkzJIcvCCcLOJzfZTwd-3dt9DktpQCjvb2X2fI_AjbFuxfjBZiT090cI8eB9zMg5JoPk5aMd8F0ENIKA_1RNMGOX2hX5g11_iyIYcVA4mudt9q7OYf3kMIljmVx-sUTf5pA8npyiv79cvOSejJccWp8d4-nGF6y4wddTNahpae7bKcJ6XCJ09MtnGaqnrY917iJq6NBmXD6wYFQUPQoVJZ4vimU1FywCJSl7PMugbDFRAwhrjAwg_U6KcxH27YnrhsrXBA9TEswhvntF2av0q6ycpFbZsBelejTavbu_HY6tpfu9x80j-fUjHy5Wu2e6r3JDaYXbd1gt-xkeRF3MiGp3KnW1c_WvX4fJexKyafXp6ANpRr2rNl5GipLc9PlqwMEjv3ghCZ4Dd0D0pVzBPcsbbx919sBjJSOoI3wK8GXghCMwy_SMLcC47hwQry08jYE1rXi5igU_EQLtx1zyr7RzTvmmvWvRBrdPMFz2sXVVYsS3UOMHbXwJRnDZOV5kD-3Rn6EpkDTxu_ZAR4vk4TP818407Dbt5Q3x4DkTzCz-6p_wVICOyOY2yHO6cpPp4ErBtg-iCqcoG-uzDr4BK3bRn362QbwyWvBX0TOJEwZ2Xh7myw1jACnl3QoR8gvpqymLorAUYBdLvkJsGb4Jj1DEIZe9AAbF6fUysr4bIBpF-eQovTE4vqjMy17sPzmXWFXWo5PKcC0DdcM4UMryMSPGEAIStl5pOmTfVMPEuDSX4cBlzXB6Omd5JUUwmTHBtf3Rb-fgQAgxU8THdw-a5_yVB7Xr_7HpKPWhI3FFphxAWCsyVS2u-wemhHJ_oqwavG_xIcmUyZZc6PgVFgTvtc4u_c66eevkP4sYmQPQ2LwcLMMihECUHKl3d2BiENl7crjIfI68Tex2o1sN0e5Ye6tDIGXFQzYbGDOpv_ArglgYZyciigmJoT5bJ6DziE274ZNMW1id2PStHYiZVcUbLOybzCECtVTBYXVB_VpeR1_Xb47IimVEcSDIao892Z5OzzBEQTxFjdKy6n1vdI0--tgCne8Zu_Geeahcq9nyp8uRlUsHXOaVIGHCLFrrKq4GxuAIoLbdrCUn6GqTQlHrmAA4qpu1gYI5EPQYZOkJ5KApIqfvUhwprdoEViZNvCLADU1fffYoxeYEBijhvJWc1gWAhOEqenaEu0O4JoEuFQtXt9klitUBrZQL9FRXAqBHqfGpsWNj_oUXMcyb7MGRxGyOrfBhLh_SbOMlzOnOPQUsIqXSvIURIPFgZpU0LWGrj1BPYVG_qdM26hb89ybGIV_2aqox8SQrv-cd5ggeLgl1WdDF8PkbpIYlwxLmyPhUNzeKqbMQRL7BGxhXMqHEJHbYE5fdY3QW5WB7cwesUss1Z6n4N5h8AUCXhiKB7N_Mld5lWQBxMVJAabzqIMDM0om7z1N_UYHEoZfA._TNAcCKpZVg2r5kjemyPxwF1yCKCOQxQRj_5y6i-0Rk",
                    "Content-Type": "application/json",
                    "Ubi-AppId": "f78cbbdb-72eb-47f4-af54-91618c1eecd0",
                    "Host": "public-ubiservices.ubi.com",
                    "Content-Length": "0"
                }
            };
            redirect(httpsopts, json, function (redResponse) {
                var responsepar = JSON.parse(redResponse);
                var auth = responsepar["ticket"];
                const httpsopts2 = {
                    hostname: "prod.just-dance.com",
                    port: 443,
                    path: "/content-authorization/v1/maps/" + request.params.map,
                    method: "GET",
                    headers: {
                        Accept: "*/*",
                        Authorization: "Ubi_v1 " + auth,
                        "Content-Type": "application/json",
                        "X-SkuId": "jd2021-xone-all"
                    }
                };
                redirect(httpsopts2, "", function (redResponse) {
                    var strdata = JSON.parse(redResponse);
                    response.send(strdata);
                    addStats(request.params.map);
                });
            });
        }
    }
});

app.get("/profile/v2/profiles", (req, res) => {
    var auth = req.header("Authorization");
    const httpsopts = {
        hostname: "prod.just-dance.com",
        port: 443,
        path: "/profile/v2/profiles?profileIds=" + req.query.profileIds,
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

app.post("/profile/v2/profiles", function (req, res) {
    res.redirect(307, "https://prod.just-dance.com/profile/v2/profiles");
});

// v1
app.get(
    "/v1/applications/341789d4-b41f-4f40-ac79-e2bc4c94ead4/configuration",
    function (request, response) {
    response.send(v1);
});

// v2
app.get("/v2/spaces/f1ae5b84-db7c-481e-9867-861cf1852dc8/entities", function (
        request,
        response) {
    response.send(v2);
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

// Users
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
    redirect(httpsopts, "", function (redResponse) {
        res.send(redResponse);
    });
});

// World Dance Floor
app.post("/wdf/v1/assign-room", (req, res) => {
    var json = JSON.stringify({
        "playGlobally": 1
    })
        var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/assign-room',
        method: 'POST',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'Content-Type': 'application/json',
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})
app.get("/wdf/v1/rooms/PCJD2017/ccu", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/rooms/PCJD2017/ccu',
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})
app.get("/wdf/v1/rooms/PCJD2017/newsfeed", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/rooms/PCJD2017/newsfeed',
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})
app.get("/wdf/v1/rooms/PCJD2017/notification", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/rooms/PCJD2017/notification',
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})
app.post("/wdf/v1/rooms/PCJD2017/screens", (req, res) => {
    var auth = req.header('Authorization');
    var json = JSON.stringify(req.body);
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/rooms/PCJD2017/screens',
        method: 'POST',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, json, function (redResponse) {
        res.send(redResponse)
    })
})
app.get("/wdf/v1/online-bosses", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/online-bosses',
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})
app.get("/wdf/v1/server-time", (req, res) => {
    var auth = req.header('Authorization');
    const httpsopts = {
        hostname: 'prod.just-dance.com',
        port: 443,
        path: '/wdf/v1/server-time',
        method: 'GET',
        headers: {
            'User-Agent': 'UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static',
            'Accept': '*/*',
            'Accept-Language': 'en-us,en',
            'Authorization': auth,
            'X-SkuId': 'jd2017-pc-ww'
        }
    }
    redirect(httpsopts, '', function (redResponse) {
        res.send(redResponse)
    })
})

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
    redirect(httpsopts, json, function (redResponse) {
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
const listener = app.listen(process.env.PORT, function () {
    console.log("Your app is listening on port " + listener.address().port);
});

//Add statistics to the server
function addStats(codename) {
    fs.readFile("./statistics/playedSong/alltime.json", "utf-8", function (
            err,
            data) {
        if (err)
            throw err;
        var arrayOfObjects = JSON.parse(data);
        arrayOfObjects[codename] = arrayOfObjects[codename] + 1;
        fs.writeFile(
            "./statistics/playedSong/alltime.json",
            JSON.stringify(arrayOfObjects),
            "utf-8",
            function (err) {
            if (err)
                throw err;
            console.log("All-Time stats of " + codename + " changed");
        });
    });
    fs.readFile("./statistics/playedSong/total.json", "utf-8", function (
            err,
            data) {
        if (err)
            throw err;
        var arrayOfObjects = JSON.parse(data);
        arrayOfObjects["total"] = arrayOfObjects["total"] + 1;
        fs.writeFile(
            "./statistics/playedSong/total.json",
            JSON.stringify(arrayOfObjects),
            "utf-8",
            function (err) {
            if (err)
                throw err;
            console.log("Total stats of " + codename + " changed");
        });
    });
}
