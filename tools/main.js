// column names
const PRESS_LEFT = "Press.Left";
const PRESS_CENTER = "Press.Center";
const PRESS_RIGHT = "Press.Right";
const ACCEL_X = "Accel.X";
const ACCEL_Y = "Accel.Y";
const ACCEL_Z = "Accel.Z";
const MAGNET_X = "Magnet.X";
const MAGNET_Y = "Magnet.Y";
const MAGNET_Z = "Magnet.Z";
const GYRO_X = "Gyro.X";
const GYRO_Y = "Gyro.Y";
const GYRO_Z = "Gyro.Z";

// general
let filename = "";
let fileLoaded = false;
let bds_times_max = 0;
let sliderBaseChange = 5000;
let plotZoom = 1;

displayTraceConf = {
    press: true,
    accel: false,
    magnet: false,
    gyro: false,
};

controls = [
    { name: "Entrance point", style: "solid", color: "#FF0000", hidden: false, opacity: 0.9, position: 0 },
    { name: "Nadir pressure", style: "solid", color: "#00FF00", hidden: false, opacity: 0.9, position: 0 },
    { name: "Tailwater", style: "solid", color: "#0000FF", hidden: false, opacity: 0.9, position: 0 },
];

// data loading
function loadFile(fileobj) {
    filename = fileobj.name.split(".")[0];
    dfd.readCSV(fileobj).then((df) => {
        handleCSV(df);
    });
}

function handleCSV(df_) {
    df = df_;

    bds_times = df["Timestamp"].sub(df["Timestamp"].min()).$data;
    bds_times_max = df["Timestamp"].max() - df["Timestamp"].min();

    bds_press = df.loc({ columns: [PRESS_LEFT, PRESS_CENTER, PRESS_RIGHT] }).mean().$data;

    bds_accelX = df[ACCEL_X].$data;
    bds_accelY = df[ACCEL_Y].$data;
    bds_accelZ = df[ACCEL_Z].$data;

    bds_magnetX = df[MAGNET_X].$data;
    bds_magnetY = df[MAGNET_Y].$data;
    bds_magnetZ = df[MAGNET_Z].$data;

    bds_gyroX = df[GYRO_X].$data;
    bds_gyroY = df[GYRO_Y].$data;
    bds_gyroZ = df[GYRO_Z].$data;

    drawPlot();
    fileLoaded = true;
    loadUI();
}

function loadUI() {
    // make em vissible
    const controlsList = document.getElementById("controls-list");
    controlsList.style.display = "";
    const cListChildren = controlsList.children;

    // attach event handlers to forms
    controls.forEach((child, index) => {
        // name
        const name_elem = cListChildren[index].getElementsByClassName("c-name")[0];
        child.name_elem = name_elem;
        name_elem.oninput = (event) => {
            child.name = event.target.value;
            drawPlot();
            // console.log(child.name);
        };

        // hide button
        const hide_elem = cListChildren[index].getElementsByClassName("c-hide")[0];
        child.hide_elem = hide_elem;
        hide_elem.onclick = (event) => {
            child.hidden = !child.hidden;
            if (child.hidden) {
                hide_elem.innerText = "SHOW";
            } else {
                hide_elem.innerText = "HIDE";
            }
            drawPlot();
            // console.log(child.hidden);
        };

        // color picker
        const color_elem = cListChildren[index].getElementsByClassName("c-color")[0];
        child.color_elem = color_elem;
        color_elem.oninput = (event) => {
            child.color = event.target.value;
            drawPlot();
            // console.log(child.color);
        };

        // line style
        const style_elem = cListChildren[index].getElementsByClassName("c-style")[0];
        child.style_elem = style_elem;
        style_elem.oninput = (event) => {
            child.style = event.target.value;
            drawPlot();
            // console.log(child.style);
        };

        // opacity
        const opacity_elem = cListChildren[index].getElementsByClassName("c-opacity")[0];
        child.opacity_elem = opacity_elem;
        opacity_elem.oninput = (event) => {
            child.opacity = event.target.value;
            drawPlot();
            // console.log(child.opacity);
        };

        // position
        const pos_elem = cListChildren[index].getElementsByClassName("c-pos")[0];
        child.pos_elem = pos_elem;
        pos_elem.oninput = (event) => {
            let new_position = event.target.value;
            if (new_position >= 0 && new_position <= bds_times_max) {
                child.position = new_position;
            } else {
                child.position = new_position < 0 ? 0 : bds_times_max;
            }
            pos_elem.value = child.position;
            drawPlot();
            // console.log(child.position);
        };

        // position adjust slider
        const pos_slider_elem = cListChildren[index].getElementsByClassName("c-pos-slider")[0];
        child.pos_slider_elem = pos_slider_elem;
        pos_slider_elem.onchange = (event) => {
            pos_slider_elem.value = 0;
            stopSliderChange(child);
        };
        pos_slider_elem.oninput = (event) => {
            doSliderChange(child, event.target.value);
        };

        // backward update
        child.update = () => {
            child.name_elem.value = child.name;
            child.style_elem.value = child.style;
            child.color_elem.value = child.color;
            child.hide_elem.value = child.hidden;
            child.opacity_elem.value = child.opacity;
            child.pos_elem.value = child.position;
            child.pos_elem.min = 0;
            child.pos_elem.max = bds_times_max;
            child.pos_elem.step = 1;
        };

        child.update();
    });

    // attach buttons to change trance vissibility
    const btnList = document.getElementById("c-trance");
    const btnListChildren = btnList.children;
    const btnIds = ["press", "accel", "magnet", "gyro"];
    Array.from(btnListChildren).forEach((child, index) => {
        child.onclick = () => {
            btnId = btnIds[index];
            displayTraceConf[btnId] = !displayTraceConf[btnId];
            if (displayTraceConf[btnId]) {
                if (child.classList.contains("btn-outline-primary")) {
                    child.classList.remove("btn-outline-primary");
                }
                child.classList.add("btn-primary");
            } else {
                if (child.classList.contains("btn-primary")) {
                    child.classList.remove("btn-primary");
                }
                child.classList.add("btn-outline-primary");
            }
            drawPlot();
        };
        child.classList.remove("disabled");
    });

    document.getElementById("jsonImport").classList.remove("disabled");
    document.getElementById("jsonExport").classList.remove("disabled");
}

function doSliderChange(obj, sliderValue) {
    if (obj.intervalJob) {
        clearInterval(obj.intervalJob);
    }
    jobfunc = () => {
        let dynamic_zoom = plotZoom ** 2;
        dynamic_zoom = dynamic_zoom < 0.0005 ? 0.0005 : dynamic_zoom;

        let new_position = Math.round(obj.position + (sliderValue / 100) * sliderBaseChange * dynamic_zoom);

        if (new_position >= 0 && new_position <= bds_times_max) {
            obj.position = new_position;
        } else {
            obj.position = new_position < 0 ? 0 : bds_times_max;
        }

        obj.pos_elem.value = obj.position;
        drawPlot();
    };

    jobfunc();
    obj.intervalJob = setInterval(jobfunc, 10);
}

function stopSliderChange(obj) {
    if (obj.intervalJob) {
        clearInterval(obj.intervalJob);
    }
}

function toogleTrance(trace) {
    switch (trace) {
        case "accel":
            displayTraceConf["accel"] = !displayTraceConf["accel"];
            break;
        case "magnet":
            displayTraceConf["magnet"] = !displayTraceConf["magnet"];
            break;
        case "gyro":
            displayTraceConf["gyro"] = !displayTraceConf["gyro"];
            break;
        default:
            displayTraceConf["press"] = !displayTraceConf["press"];
            break;
    }
}

function getTranceVisibility(traceName) {
    return displayTraceConf[traceName] ? "true" : "legendonly";
}

var getPlotData = () => [
    { name: "Pressure", visible: getTranceVisibility("press"), x: bds_times, y: bds_press, mode: "lines" },
    { name: "Acceleration X", visible: getTranceVisibility("accel"), x: bds_times, y: bds_accelX, mode: "lines" },
    { name: "Acceleration Y", visible: getTranceVisibility("accel"), x: bds_times, y: bds_accelY, mode: "lines" },
    { name: "Acceleration Z", visible: getTranceVisibility("accel"), x: bds_times, y: bds_accelZ, mode: "lines" },
    { name: "Magnitude X", visible: getTranceVisibility("magnet"), x: bds_times, y: bds_magnetX, mode: "lines" },
    { name: "Magnitude Y", visible: getTranceVisibility("magnet"), x: bds_times, y: bds_magnetY, mode: "lines" },
    { name: "Magnitude Z", visible: getTranceVisibility("magnet"), x: bds_times, y: bds_magnetZ, mode: "lines" },
    { name: "Gyroscope X", visible: getTranceVisibility("gyro"), x: bds_times, y: bds_gyroX, mode: "lines" },
    { name: "Gyroscope Y", visible: getTranceVisibility("gyro"), x: bds_times, y: bds_gyroY, mode: "lines" },
    { name: "Gyroscope Z", visible: getTranceVisibility("gyro"), x: bds_times, y: bds_gyroZ, mode: "lines" },
];

var getPointNames = () => ({
    x: controls.map((ctrl) => {
        return ctrl.position;
    }),
    y: controls.map((ctrl) => {
        return 1;
    }),
    textposition: "bottom",
    text: controls.map((ctrl) => {
        return ctrl.name;
    }),
    mode: "text",
});

var getPlotLayout = () => ({
    title: {
        text: filename,
        font: {
            size: 24,
        },
    },
    uirevision: "true",
    shapes: controls.map((ctrl) => {
        return {
            type: "line",
            yref: "paper",
            x0: ctrl.position,
            y0: 0,
            x1: ctrl.position,
            y1: 1,
            opacity: ctrl.hidden ? 0 : ctrl.opacity,
            line: {
                color: ctrl.color,
                width: 2.5,
                dash: ctrl.style,
            },
        };
    }),
});

function drawPlot() {
    if (fileLoaded) {
        Plotly.react("canvas", getPlotData(), getPlotLayout());
    } else {
        Plotly.newPlot("canvas", getPlotData(), getPlotLayout()).then(() => {
            var canvas = document.getElementById("canvas");
            canvas.on("plotly_relayout", function (eventdata) {
                const x1 = eventdata["xaxis.range[0]"];
                const x2 = eventdata["xaxis.range[1]"];
                const xx = x2 - x1;
                let  plotZoom = isFinite(xx) ? xx / bds_times_max : 1;
                plotZoom = plotZoom <= 0 ? 0.0001 : plotZoom;
                // console.log(zoom);
            });
        });
    }
}

function exportJSON() {
    const jsonStr = JSON.stringify(
        controls.map((elem) => {
            return { name: elem.name, time: elem.position };
        })
    );

    const options = {
        suggestedName: filename,
        types: [
            {
                accept: {
                    "application/json": [".json"],
                },
            },
        ],
    };

    window.showSaveFilePicker(options).then((handle) => {
        handle.createWritable().then((writtable) => {
            writtable.write(jsonStr);
            writtable.close();
        });
    });
}

function importJSON() {
    let element = document.createElement("input");

    element.setAttribute("type", "file");
    element.setAttribute("accept", ".json");
    element.style.display = "none";

    element.addEventListener("change", (event) => {
        const fileList = event.target.files;
        if (fileList.length > 0) {
            // console.log(fileList[0]);
            const reader = new FileReader();
            reader.onload = function () {
                // console.log(reader.result);
                // console.log(JSON.parse(reader.result));
                list = JSON.parse(reader.result);
                list.forEach((elem, idx) => {
                    controls[idx].name = elem.name;
                    controls[idx].position = elem.time;
                    controls[idx].update();
                });
                drawPlot();
            };
            reader.readAsText(fileList[0]);
        }
    });
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}
