ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        center: [53.925810, 30.355942], 
        zoom: 15 
    });

    var myPlacemark = new ymaps.Placemark([53.925810, 30.355942], {
        balloonContentHeader: "Офис",
        balloonContentBody: "ул. Ивана Мазалова, 1",
        hintContent: "Центральный офис"
    }, {
        preset: 'islands#blueDotIcon' 
    });

    myMap.geoObjects.add(myPlacemark);
}