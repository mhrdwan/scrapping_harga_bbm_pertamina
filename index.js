const puppeteer = require('puppeteer');
const express = require('express');
const moment = require('moment');
const cors = require('cors')
const app = express();
const date = new Date()
app.use(cors())
const sudahdiubah = moment(date).format('hh:mm:ss DD-MM-YYYY ')
const idprov = [
    {
        "id": 11,
        "province_name": "Prov. Aceh"
    },
    {
        "id": 12,
        "province_name": "Prov. Sumatera Utara"
    },
    {
        "id": 13,
        "province_name": "Prov. Sumatera Barat"
    },
    {
        "id": 14,
        "province_name": "Prov. Riau"
    },
    {
        "id": 21,
        "province_name": "Prov. Kepulauan Riau"
    },
    {
        "id": 15,
        "province_name": "Prov. Jambi"
    },
    {
        "id": 17,
        "province_name": "Prov. Bengkulu"
    },
    {
        "id": 16,
        "province_name": "Prov. Sumatera Selatan"
    },
    {
        "id": 19,
        "province_name": "Prov. Bangka-Belitung"
    },
    {
        "id": 18,
        "province_name": "Prov. Lampung"
    },
    {
        "id": 31,
        "province_name": "Prov. DKI Jakarta"
    },
    {
        "id": 36,
        "province_name": "Prov. Banten"
    },
    {
        "id": 32,
        "province_name": "Prov. Jawa Barat"
    },
    {
        "id": 33,
        "province_name": "Prov. Jawa Tengah"
    },
    {
        "id": 34,
        "province_name": "Prov. DI Yogyakarta"
    },
    {
        "id": 35,
        "province_name": "Prov. Jawa Timur"
    },
    {
        "id": 51,
        "province_name": "Prov. Bali"
    },
    {
        "id": 52,
        "province_name": "Prov. Nusa Tenggara Barat"
    },
    {
        "id": 53,
        "province_name": "Prov. Nusa Tenggara Timur"
    },
    {
        "id": 61,
        "province_name": "Prov. Kalimantan Barat"
    },
    {
        "id": 62,
        "province_name": "Prov. Kalimantan Tengah"
    },
    {
        "id": 63,
        "province_name": "Prov. Kalimantan Selatan"
    },
    {
        "id": 64,
        "province_name": "Prov. Kalimantan Timur"
    },
    {
        "id": 65,
        "province_name": "Prov. Kalimantan Utara"
    },
    {
        "id": 71,
        "province_name": "Prov. Sulawesi Utara"
    },
    {
        "id": 75,
        "province_name": "Prov. Gorontalo"
    },
    {
        "id": 72,
        "province_name": "Prov. Sulawesi Tengah"
    },
    {
        "id": 73,
        "province_name": "Prov. Sulawesi Tenggara"
    },
    {
        "id": 74,
        "province_name": "Prov. Sulawesi Selatan"
    },
    {
        "id": 76,
        "province_name": "Prov. Sulawesi Barat"
    },
    {
        "id": 81,
        "province_name": "Prov. Maluku"
    },
    {
        "id": 82,
        "province_name": "Prov. Maluku Utara"
    },
    {
        "id": 92,
        "province_name": "Prov. Papua"
    },
    {
        "id": 91,
        "province_name": "Prov. Papua Barat"
    },
    {
        "id": 93,
        "province_name": "Prov. Papua Selatan"
    },
    {
        "id": 94,
        "province_name": "Prov. Papua Pegunungan"
    },
    {
        "id": 95,
        "province_name": "Prov. Papua Tengah"
    },
    {
        "id": 96,
        "province_name": "Prov. Papua Barat Daya"
    }
]
const getdatanya = async () => {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://mypertamina.id/fuels-harga', { waitUntil: 'networkidle2' });

        // Evaluate the page to extract the necessary information
        const data = await page.evaluate(() => {
            let results = [];
            const cards = document.querySelectorAll('#priceSlider > div > div > div');

            cards.forEach((card, index) => {
                const tgl_update = card.querySelector('div > div.text-center.mb-3 > p')?.textContent.trim();
                const allContent = card.textContent.trim();
                const gambar = card.querySelector('div > div.text-center.mb-3 > img')?.getAttribute('src');
                let nama_bbm = gambar.split('/').pop().split('.').shift();

                // Updated regex to capture '-' as a price
                const regex = /Prov\..+?(?=\s+Rp|\s+-)(\s+Rp[\d.-]+|\s+-)/g;
                let data = [];
                let matches;

                while ((matches = regex.exec(allContent)) !== null) {
                    let [fullMatch, price] = matches;
                    let provinsi = fullMatch.replace(price, '').trim();
                    price = price.trim().replace('Rp', '').replace(/[.,]/g, '').replace(/-/g, '0').trim();
                    data.push({ provinsi, harga: price });
                }

                results.push({ no: index + 1, nama_bbm, tgl_update, gambar, data });
            });

            return results;
        });
        const dataDenganId = data.map(item => {
            item.data = item.data.map(provinsiData => {
                const provinsiItem = idprov.find(p => p.province_name.includes(provinsiData.provinsi));
                return { ...provinsiData, id: provinsiItem ? provinsiItem.id : null };
            });
            return item;
        });

        return dataDenganId;

    } catch (error) {
        console.error(error.message);
        return { error: "An error occurred during data fetching" };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

app.get('/', async (req, res) => {
    try {
        const data = await getdatanya();
        if (data.error) {
            res.status(500).json(data);
        } else {
            res.json({ message: "Data Berhasil di perbaharui" + " " + sudahdiubah, data });
        }
    } catch (error) {
        res.status(500).send("An error occurred in the server");
    }
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
