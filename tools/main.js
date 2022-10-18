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

controls = [
    { name: "Entrance point", style: "solid", color: "#FF0000", hidden: false, opacity: 0.9, position: 0 },
    // { name: "Nadir pressure" },
    // { name: "Tailwater" }
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
    controlsList = document.getElementById("controls-list");
    controlsList.style.display = "";
    cListChildren = controlsList.children;

    // attach event handlers to forms
    controls.forEach((child, index) => {
        // name
        name_elem = cListChildren[index].getElementsByClassName("c-name")[0];
        child.name_elem = name_elem;
        name_elem.oninput = (event) => {
            child.name = event.target.value;
            drawPlot();
            // console.log(child.name);
        };

        // hide button
        hide_elem = cListChildren[index].getElementsByClassName("c-hide")[0];
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
        color_elem = cListChildren[index].getElementsByClassName("c-color")[0];
        child.color_elem = color_elem;
        color_elem.oninput = (event) => {
            child.color = event.target.value;
            drawPlot();
            // console.log(child.color);
        };

        // line style
        style_elem = cListChildren[index].getElementsByClassName("c-style")[0];
        child.style_elem = style_elem;
        style_elem.oninput = (event) => {
            child.style = event.target.value;
            drawPlot();
            // console.log(child.style);
        };

        // opacity
        opacity_elem = cListChildren[index].getElementsByClassName("c-opacity")[0];
        child.opacity_elem = opacity_elem;
        opacity_elem.oninput = (event) => {
            child.opacity = event.target.value;
            drawPlot();
            // console.log(child.opacity);
        };

        // position
        pos_elem = cListChildren[index].getElementsByClassName("c-pos")[0];
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
        pos_slider_elem = cListChildren[index].getElementsByClassName("c-pos-slider")[0];
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
}

function doSliderChange(obj, sliderValue) {
    if (obj.intervalJob) {
        clearInterval(obj.intervalJob);
    }
    jobfunc = () => {
        let new_position = Math.round(obj.position + (sliderValue / 100) * sliderBaseChange * plotZoom ** 2);

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

var getPlotData = () => [{ x: bds_times, y: bds_press, mode: "lines" }];

var getPlotLayout = () => ({
    title: filename,
    uirevision: "true",
    shapes: [
        {
            type: "line",
            yref: "paper",
            x0: controls[0].position, // * Math.max(...bds_times),
            y0: 0,
            x1: controls[0].position, // * Math.max(...bds_times),
            y1: 1,
            opacity: controls[0].hidden ? 0 : controls[0].opacity,
            line: {
                color: controls[0].color,
                width: 2.5,
                dash: controls[0].style,
            },
        },
    ],
});

function drawPlot() {
    if (fileLoaded) {
        Plotly.react("canvas", getPlotData(), getPlotLayout());
    } else {
        Plotly.newPlot("canvas", getPlotData(), getPlotLayout()).then(() => {
            var canvas = document.getElementById("canvas");

            canvas.on("plotly_relayout", function (eventdata) {
                // test = eventdata
                // console.log(eventdata);
                let x1 = eventdata["xaxis.range[0]"];
                let x2 = eventdata["xaxis.range[1]"];
                let xx = x2 - x1;
                plotZoom = isFinite(xx) ? xx / bds_times_max : 1;
                plotZoom = plotZoom <= 0 ? 0.0001 : plotZoom;
                // console.log(zoom);
            });
        });
    }
}

line_pos = 0;

function testLine(value) {
    // line_pos = value / 1000;
    line_pos = value;
    if (fileLoaded) {
        drawPlot();
    }
    // console.log(line_pos);
}
