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

// data loading
function loadFile(filepath) {
    dfd.readCSV(filepath).then((df) => {
        handleCSV(df);
    });
}

function handleCSV(df_) {
    df = df_;

    bds_times = df["Timestamp"].sub(df["Timestamp"].min()).$data;
    bds_press = df
        .loc({ columns: [PRESS_LEFT, PRESS_CENTER, PRESS_RIGHT] })
        .mean().$data;

    bds_accelX = df[ACCEL_X].$data;
    bds_accelY = df[ACCEL_Y].$data;
    bds_accelZ = df[ACCEL_Z].$data;

    bds_magnetX = df[MAGNET_X].$data;
    bds_magnetY = df[MAGNET_Y].$data;
    bds_magnetZ = df[MAGNET_Z].$data;

    bds_gyroX = df[GYRO_X].$data;
    bds_gyroY = df[GYRO_Y].$data;
    bds_gyroZ = df[GYRO_Z].$data;

    // df_time = df["Timestamp"]
    // df_time = df_time.sub(df_time.min())

    // df = df.drop("Timestamp")
    // df = df.addColumn("Timestamp", df_time)

    // console.log(df);

    // df["Timestamp"].sub(df["Timestamp"].min(), { inplace: true });

    // df = new dfd.DataFrame(csv);
    // console.log(df.columns);
    // df["Timestamp"].min().print()
    // df["Timestamp"] = df["Timestamp"] - df["Timestamp"].min()
    // console.log(df["Timestamp"]);

    // press = df.loc({ columns: ["Press.Left", "Press.Center", "Press.Right"] })
    // press.plot("pressure").line();

    // accel = df.loc({ columns: ["Accel.X", "Accel.Y", "Accel.Z"] })
    // accel.plot("acceleration").line();

    // magnet = df.loc({ columns: ["Magnet.X", "Magnet.Y", "Magnet.Z"] })
    // magnet.plot("magnitude").line();

    // gyro = df.loc({ columns: ["Gyro.X", "Gyro.Y", "Gyro.Z"] })
    // gyro.plot("gyro").line();
}
