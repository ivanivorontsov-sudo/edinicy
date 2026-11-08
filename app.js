(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const unitSets = {
    length: {label:"Длина", units:[
      ["mm","Миллиметр (мм)",0.001],["cm","Сантиметр (см)",0.01],["m","Метр (м)",1],["km","Километр (км)",1000],
      ["inch","Дюйм",0.0254],["ft","Фут",0.3048],["yd","Ярд",0.9144],["mi","Сухопутная миля",1609.344],["nmi","Морская миля",1852]
    ]},
    mass: {label:"Масса",units:[
      ["mg","Миллиграмм (мг)",0.000001],["g","Грамм (г)",0.001],["kg","Килограмм (кг)",1],["t","Тонна (т)",1000],
      ["lb","Фунт",0.45359237],["oz","Унция",0.028349523125],["ct","Карат",0.0002]
    ]},
    volume:{label:"Объём",units:[
      ["ml","Миллилитр (мл)",0.001],["l","Литр (л)",1],["m3","Кубический метр (м³)",1000],["usgal","Галлон США",3.785411784],
      ["ukgal","Британский галлон",4.54609],["bbl","Нефтяной баррель",158.987294928]
    ]},
    area:{label:"Площадь",units:[
      ["mm2","Квадратный миллиметр (мм²)",0.000001],["cm2","Квадратный сантиметр (см²)",0.0001],["m2","Квадратный метр (м²)",1],
      ["are","Ар / сотка",100],["ha","Гектар (га)",10000],["km2","Квадратный километр (км²)",1000000],
      ["acre","Акр",4046.8564224],["ft2","Квадратный фут",0.09290304]
    ]},
    speed:{label:"Скорость",units:[
      ["ms","Метр в секунду (м/с)",1],["kmh","Километр в час (км/ч)",1/3.6],["mph","Миля в час",0.44704],["knot","Узел",1852/3600]
    ]},
    pressure:{label:"Давление",units:[
      ["pa","Паскаль (Па)",1],["kpa","Килопаскаль (кПа)",1000],["bar","Бар",100000],["atm","Стандартная атмосфера (атм)",101325],
      ["at","Техническая атмосфера (кгс/см²)",98066.5],["mmhg","Миллиметр рт. ст.",133.322387415],["psi","Фунт-сила на кв. дюйм (psi)",6894.757293168]
    ]},
    temperature:{label:"Температура",units:[["C","Цельсий (°C)"],["F","Фаренгейт (°F)"],["K","Кельвин (K)"]]},
    data:{label:"Объём данных",units:[
      ["bit","Бит",0.125],["byte","Байт",1],["kB","Килобайт (кБ)",1000],["MB","Мегабайт (МБ)",1000000],
      ["GB","Гигабайт (ГБ)",1000000000],["KiB","Кибибайт (КиБ)",1024],["MiB","Мебибайт (МиБ)",1048576],
      ["GiB","Гибибайт (ГиБ)",1073741824],["TiB","Тебибайт (ТиБ)",1099511627776]
    ]}
  };
  const numberFormat = new Intl.NumberFormat("ru-RU",{maximumFractionDigits:10});
  const nice = (n) => Number.isFinite(n) ? numberFormat.format(Number(n.toPrecision(12))) : "—";
  function fillUnits() {
    const kind=$("unit-kind").value, units=unitSets[kind].units;
    ["unit-from","unit-to"].forEach((id,index)=>{
      const select=$(id); select.replaceChildren();
      units.forEach((u,i)=>{const option=document.createElement("option");option.value=u[0];option.textContent=u[1];select.append(option);});
      select.selectedIndex=index===0?0:Math.min(1,units.length-1);
    });
    calculateUnits();
  }
  function temperatureToC(value,unit){return unit==="C"?value:unit==="F"?(value-32)*5/9:value-273.15;}
  function cToTemperature(value,unit){return unit==="C"?value:unit==="F"?value*9/5+32:value+273.15;}
  function calculateUnits(){
    const value=Number($("unit-amount").value),kind=$("unit-kind").value;
    const from=$("unit-from").value,to=$("unit-to").value,units=unitSets[kind].units;
    const source=units.find(u=>u[0]===from),target=units.find(u=>u[0]===to);
    if($("unit-amount").value.trim()===""||!Number.isFinite(value)){ $("unit-result").textContent="Введите число";$("unit-note").textContent="Допускаются целые и дробные значения.";return;}
    let result;
    if(kind==="temperature") result=cToTemperature(temperatureToC(value,from),to);
    else result=value*source[2]/target[2];
    const suffix=target[1].match(/\(([^)]+)\)/)?.[1]||target[1];
    $("unit-result").textContent=nice(result)+" "+suffix;
    $("unit-note").textContent=nice(value)+" "+source[1]+" = "+nice(result)+" "+target[1]+".";
  }
  $("unit-kind").addEventListener("change",fillUnits);
  ["unit-amount","unit-from","unit-to"].forEach(id=>$(id).addEventListener("input",calculateUnits));
  $("unit-from").addEventListener("change",calculateUnits);$("unit-to").addEventListener("change",calculateUnits);
  fillUnits();

  const currencyList=[
    ["RUB","Российский рубль"],["USD","Доллар США"],["EUR","Евро"],["CNY","Китайский юань"],["GBP","Фунт стерлингов"],
    ["JPY","Японская иена"],["KZT","Казахстанский тенге"],["BYN","Белорусский рубль"],["AMD","Армянский драм"],
    ["TRY","Турецкая лира"],["AED","Дирхам ОАЭ"],["INR","Индийская рупия"],["CAD","Канадский доллар"],
    ["AUD","Австралийский доллар"],["CHF","Швейцарский франк"],["KRW","Южнокорейская вона"],["GEL","Грузинский лари"],
    ["UAH","Украинская гривна"],["PLN","Польский злотый"],["THB","Тайский бат"],["BRL","Бразильский реал"],
    ["SGD","Сингапурский доллар"],["SEK","Шведская крона"],["NOK","Норвежская крона"],["ZAR","Южноафриканский рэнд"]
  ];
  const rateCache=new Map();
  ["money-from","money-to"].forEach((id,index)=>{
    const select=$(id);
    currencyList.forEach(([code,name])=>{const option=document.createElement("option");option.value=code;option.textContent=code+" — "+name;select.append(option);});
    select.value=index===0?"RUB":"USD";
  });
  let currentRates=null;
  let currencyRequest=0;
  const currencyNames=Object.fromEntries(currencyList);
  let currencyDisplay=null;
  try{currencyDisplay=new Intl.DisplayNames(["ru"],{type:"currency"});}catch(_){}
  function populateCurrencyOptions(rates){
    const codes=Object.keys(rates).sort();
    ["money-from","money-to"].forEach(id=>{
      const select=$(id),previous=select.value;
      select.replaceChildren();
      codes.forEach(code=>{
        const option=document.createElement("option");
        option.value=code;
        let display=currencyNames[code];
        if(!display&&currencyDisplay){try{display=currencyDisplay.of(code);}catch(_){}}
        option.textContent=display&&display!==code?code+" — "+display:code;
        select.append(option);
      });
      select.value=codes.includes(previous)?previous:(id==="money-from"&&codes.includes("RUB")?"RUB":codes[0]);
    });
  }
  async function getRates(base){
    const cached=rateCache.get(base);
    if(cached && Date.now()-cached.loadedAt<6*60*60*1000)return cached;
    const response=await fetch("https://open.er-api.com/v6/latest/"+encodeURIComponent(base),{cache:"no-store"});
    if(!response.ok)throw new Error("Сервис курсов ответил: "+response.status);
    const data=await response.json();
    if(data.result!=="success"||!data.rates)throw new Error("Не удалось получить таблицу курсов.");
    const rates={rates:data.rates,date:data.time_last_update_utc||"",loadedAt:Date.now()};
    rateCache.set(base,rates);return rates;
  }
  async function calculateMoney(){
    const requestId=++currencyRequest;
    const from=$("money-from").value,to=$("money-to").value,amount=Number($("money-amount").value);
    if($("money-amount").value.trim()===""||!Number.isFinite(amount)){ $("money-result").textContent="Введите сумму";return;}
    $("money-status").textContent="Загружаю справочный курс "+from+"…";
    try{
      if(!currentRates||currentRates.base!==from){
        const data=await getRates(from);
        if(requestId!==currencyRequest||from!==$("money-from").value)return;
        populateCurrencyOptions(data.rates);currentRates={base:from,...data};
      }
      if(requestId!==currencyRequest||from!==$("money-from").value)return;
      const rate=currentRates.rates[to];
      if(typeof rate!=="number"||!Number.isFinite(rate))throw new Error("Для выбранной валюты нет курса в источнике.");
      const latestRaw=$("money-amount").value.trim(),latestAmount=Number(latestRaw);
      if(latestRaw===""||!Number.isFinite(latestAmount)){ $("money-result").textContent="Введите сумму";return;}
      const converted=latestAmount*rate;
      $("money-result").textContent=nice(converted)+" "+to;
      const when=currentRates.date?new Date(currentRates.date).toLocaleString("ru-RU",{timeZone:"UTC",dateStyle:"medium",timeStyle:"short"})+" UTC":"дата не указана";
      $("money-status").textContent="1 "+from+" = "+nice(rate)+" "+to+" · данные обновлены: "+when;
    }catch(error){
      $("money-result").textContent="Курс временно недоступен";
      $("money-status").textContent=(error&&error.message?error.message:"Ошибка загрузки")+". Проверьте подключение и попробуйте снова.";
    }
  }
  $("money-amount").addEventListener("input",()=>{if(currentRates&&currentRates.base===$("money-from").value){const rate=currentRates.rates[$("money-to").value];const raw=$("money-amount").value.trim(),n=Number(raw);$("money-result").textContent=raw!==""&&Number.isFinite(n)&&Number.isFinite(rate)?nice(n*rate)+" "+$("money-to").value:"Введите сумму";}});
  $("money-to").addEventListener("change",()=>{if(currentRates&&currentRates.base===$("money-from").value){const rate=currentRates.rates[$("money-to").value];const raw=$("money-amount").value.trim(),n=Number(raw);$("money-result").textContent=raw!==""&&Number.isFinite(n)&&Number.isFinite(rate)?nice(n*rate)+" "+$("money-to").value:"Введите сумму";calculateMoney();}});
  $("money-from").addEventListener("change",()=>{currentRates=null;calculateMoney();});
  $("money-refresh").addEventListener("click",()=>{const base=$("money-from").value;rateCache.delete(base);currentRates=null;calculateMoney();});
  calculateMoney();
})();