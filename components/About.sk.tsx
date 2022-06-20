import { Box } from "@mui/material";

export default function AboutSk() {
  return (
    <Box
      sx={{
        li: {
          fontStyle: "italic",
        },
      }}
    >
      <h2>Aká je misia Spetita?</h2>

      <p>
        Spetito (<b>Spe</b>nd <b>ti</b>me <b>to</b>gether) je jednoduchá
        sociálna sieť pre dávanie nezáväzných ponúk vaším priateľom, a z opačnej
        strany, na ucelený prehľad všetkých ponúk od vaších priateľov. Ponuky
        môžu vyzerať napríklad takto:
      </p>

      <ul>
        <li>
          Idem sa bikovať na košické singletraily. Uvítam bikerskú spoločnosť.
        </li>

        <li>Večer budem na chate, návšteva ma poteší. Pivko je vychladené.</li>

        <li>
          Tento víkend plánujem výlet zo Štrbského plesa na Kriváň. Parťáci,
          hláste sa. Počasie má byť na jednotku.
        </li>

        <li>
          V piatok pôjdem z Košíc do Bratislavy a v nedeľu sa budem vraciať. Ak
          niekto potrebuje nejaký prevoz, nech mi píše.
        </li>

        <li>
          Pečiem parádny raw koláčik a dúfam, že ho sám doma jesť nebudem.
        </li>

        <li>Doučím matematiku 😜</li>
      </ul>

      <p>
        V blízkej budúcnosti sú naplánované aj skupiny - ľudia zdieľajúci
        podobné záujmy, ideálne v rovnakej lokalite, napríklad:{" "}
        <i>Košickí psíčkari</i>, <i>Prešovskí turisti</i>,{" "}
        <i>Osamelé duše Nitry</i> a pod.
      </p>

      <h2>Prečo na toto nie je vhodný Facebook?</h2>

      <p>
        Facebook síce obsahuje udalosti a tiež je v ňom možné písať ponuky do
        správ, ale obsahuje ešte plno iných vecí, ktoré znemožňujú jednoduché
        vyhľadanie všetkých relevantných ponúk. Samotné udalosti na Facebooku sú
        chápané ako pozvánky, pričom na Spetite sú to (nezáväzné) ponuky, formou
        podobnou inzerátom, no iba v rámci kruhu priateľov. Málokto asi bude
        vytvárať na Facebooku udalosť, že si ide večer trochu zabehať a rád by
        mal pri tom nejakú spoločnosť. Spetito je ideálny (aj) na takéto ponuky.
      </p>

      <p>
        Okrem toho, na Facebooku je plno irelevantných sponzorovaných príspevkov
        a reklám. Na Facebooku tiež nikdy nenájdete niektorých priateľov,
        pretože nie každý ho &quot;má v láske&quot;.
      </p>

      <h2>Prečo ponuky neobsahujú komentáre a &quot;páčiky&quot;?</h2>

      <p>
        Spetito slúži iba na zverejňovanie a prehliadanie ponúk priateľov. Ak
        niekoho nejaká ponuka osloví, následne kontaktuje svojho priateľa inou
        cestou, napríklad telefonicky, alebo komunikačnou aplikáciou, akú majú
        spolu zaužívanu. Na Spetite je do budúcna plánovaný aj čet. Myšlienka
        je, že komunikácia má byť iba medzi ponúkajucim a zainteresovaným; nie
        medzi skupinou zainteresovaných, ktorí sa ani nemusia poznať.
      </p>
    </Box>
  );
}
