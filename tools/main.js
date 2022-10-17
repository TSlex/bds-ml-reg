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
filename = "";
file_loaded = false;

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
    file_loaded = true;
}

var getPlotData = () => [{ x: bds_times, y: bds_press, mode: "lines" }];

var getPlotLayout = () => ({
    title: filename,
    uirevision: "true",
    shapes: [
        {
            type: "line",
            yref: "paper",
            x0: line_pos, // * Math.max(...bds_times),
            y0: 0,
            x1: line_pos, // * Math.max(...bds_times),
            y1: 1,
            line: {
                color: "red",
                width: 2.5,
            },
        },
    ],
});

function drawPlot() {
    if (file_loaded) {
        Plotly.react("canvas", getPlotData(), getPlotLayout());
        // let layout = getPlotLayout()

        // Plotly.react("canvas", getPlotData(), getPlotLayout());
    } else {
        Plotly.newPlot("canvas", getPlotData(), getPlotLayout()).then(() => {
            var canvas = document.getElementById("canvas");
            canvas.on("plotly_relayout", function (eventdata) {
                console.log(eventdata);
                var xAxis = eventdata.xaxis;
                var yAxis = eventdata.yaxis;
                console.log("X-axis range: " + xAxis);
                console.log("Y-axis range: " + yAxis);
            });
        });
    }
}

line_pos = 0;

function testLine(value) {
    // line_pos = value / 1000;
    line_pos = value;
    if (file_loaded) {
        drawPlot();
    }
    // console.log(line_pos);
}
