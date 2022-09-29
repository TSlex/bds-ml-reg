from pathlib import Path
from src.reader import Reader
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import pandas as pd
import copy

BASE_PATH = Path("./")
INPUT_FOLDER_PATH = BASE_PATH / "input/"
OUTPUT_FOLDER_PATH = BASE_PATH / "output/"

CSV_FOLDER_NAME = "csv"
PDF_FOLDER_NAME = "pdf"


def import_file(filename):
    # read and convert file to dataframe
    dataset = Reader.read_from_file(filename)

    # take just relevant data
    dataset = dataset[[
        "Timestamp",
        "Press.Left",
        "Press.Center",
        "Press.Right",
        "Magnet.X", "Magnet.Y", "Magnet.Z",
        "Accel.X", "Accel.Y", "Accel.Z",
        "Gyro.X", "Gyro.Y", "Gyro.Z",
    ]]

    return dataset


def plot_diagnostics(dataset):
    dataset = copy.deepcopy(dataset)
    dataset["Timestamp"] -= min(dataset["Timestamp"])
    dataset["Timestamp.Sec"] = dataset["Timestamp"] / 1000

    mean_pressure = dataset[["Press.Left", "Press.Center", "Press.Right"]].mean(axis=1)
    mean_magnitude = dataset[["Magnet.X", "Magnet.Y", "Magnet.Z"]].mean(axis=1)
    mean_acceleration = dataset[["Accel.X", "Accel.Y", "Accel.Z"]].mean(axis=1)
    mean_gyroscope = dataset[["Gyro.X", "Gyro.Y", "Gyro.Z"]].mean(axis=1)

    figures = []
    n_figures = 4

    figure, axis = plt.subplots(n_figures, 1, figsize=(10, 4 * n_figures))
    figure.tight_layout(h_pad=6, pad=6)
    figure.suptitle("B150101134132", fontsize=20)
    figure.subplots_adjust(top=0.92)

    pr_columns = ["Press.Left", "Press.Center", "Press.Right"]
    pr_names = ["Left Pressure Sensor", "Center Pressure Sensor", "Right Pressure Sensor"]

    ax = axis[0]
    ax.plot(dataset["Timestamp.Sec"], dataset["Press.Left"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Press.Center"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Press.Right"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], mean_pressure)
    ax.set_xlabel("Time (s)", fontsize=12)
    ax.set_ylabel("Pressure (hPa)", fontsize=12)
    ax.set_title("Ensemble average pressure", fontsize=14)

    for pr_i in range(len(pr_columns)):
        ax = axis[pr_i + 1]
        ax.plot(dataset["Timestamp.Sec"], dataset[pr_columns[pr_i]])

        ax.set_xlabel("Time (s)", fontsize=12)
        ax.set_ylabel("Pressure (hPa)", fontsize=12)
        ax.set_title(pr_names[pr_i], fontsize=14)

    figures.append(figure)

    figure, axis = plt.subplots(n_figures, 1, figsize=(10, 4 * n_figures))
    figure.tight_layout(h_pad=6, pad=6)

    mag_columns = ["Magnet.X", "Magnet.Y", "Magnet.Z"]
    mag_names = ["X-axis Magnitude Sensor", "Y-axis Magnitude Sensor", "Z-axis Magnitude Sensor"]

    ax = axis[0]
    ax.plot(dataset["Timestamp.Sec"], dataset["Magnet.X"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Magnet.Y"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Magnet.Z"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], mean_magnitude)
    ax.set_xlabel("Time (s)", fontsize=12)
    ax.set_ylabel("Magnitude (microT)", fontsize=12)
    ax.set_title("Ensemble average magnitude", fontsize=14)

    for mag_i in range(len(mag_columns)):
        ax = axis[mag_i + 1]
        ax.plot(dataset["Timestamp.Sec"], dataset[mag_columns[mag_i]])

        ax.set_xlabel("Time (s)", fontsize=12)
        ax.set_ylabel("Magnitude (microT)", fontsize=12)
        ax.set_title(mag_names[mag_i], fontsize=14)

    figures.append(figure)

    figure, axis = plt.subplots(n_figures, 1, figsize=(10, 4 * n_figures))
    figure.tight_layout(h_pad=6, pad=6)

    acc_columns = ["Accel.X", "Accel.Y", "Accel.Z"]
    acc_names = ["X Acceleration Sensor", "Y Acceleration Sensor", "Z Acceleration Sensor"]

    ax = axis[0]
    ax.plot(dataset["Timestamp.Sec"], dataset["Accel.X"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Accel.Y"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Accel.Z"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], mean_acceleration)
    ax.set_xlabel("Time (s)", fontsize=12)
    ax.set_ylabel("Acceleration (m/s2)", fontsize=12)
    ax.set_title("Ensemble average acceleration", fontsize=14)

    for acc_i in range(len(acc_columns)):
        ax = axis[acc_i + 1]
        ax.plot(dataset["Timestamp.Sec"], dataset[acc_columns[acc_i]])

        ax.set_xlabel("Time (s)", fontsize=12)
        ax.set_ylabel("Acceleration (m/s2)", fontsize=12)
        ax.set_title(acc_names[acc_i], fontsize=14)

    figures.append(figure)

    figure, axis = plt.subplots(n_figures, 1, figsize=(10, 4 * n_figures))
    figure.tight_layout(h_pad=6, pad=6)

    gyro_columns = ["Gyro.X", "Gyro.Y", "Gyro.Z"]
    gyro_names = ["X Gyroscope Sensor", "Y Gyroscope Sensor", "Z Gyroscope Sensor"]

    ax = axis[0]
    ax.plot(dataset["Timestamp.Sec"], dataset["Gyro.X"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Gyro.Y"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], dataset["Gyro.Z"], '--', alpha=0.2)
    ax.plot(dataset["Timestamp.Sec"], mean_gyroscope)
    ax.set_xlabel("Time (s)", fontsize=12)
    ax.set_ylabel("Gyroscope (m/s2)", fontsize=12)
    ax.set_title("Ensemble average gyroscope", fontsize=14)

    for gyro_i in range(len(gyro_columns)):
        ax = axis[gyro_i + 1]
        ax.plot(dataset["Timestamp.Sec"], dataset[gyro_columns[gyro_i]])

        ax.set_xlabel("Time (s)", fontsize=12)
        ax.set_ylabel("Gyroscope (m/s2)", fontsize=12)
        ax.set_title(gyro_names[gyro_i], fontsize=14)

    figures.append(figure)

    return figures


if __name__ == '__main__':
    INPUT_FOLDER_PATH.mkdir(parents=True, exist_ok=True)
    (OUTPUT_FOLDER_PATH / CSV_FOLDER_NAME).mkdir(parents=True, exist_ok=True)
    (OUTPUT_FOLDER_PATH / PDF_FOLDER_NAME).mkdir(parents=True, exist_ok=True)

    for f in INPUT_FOLDER_PATH.glob("*.txt"):

        # read binary
        dataset = import_file(f.as_posix())

        # convert to csv
        dataset.to_csv(OUTPUT_FOLDER_PATH / CSV_FOLDER_NAME / (f.stem + ".csv"), index=False)

        # plot diagnostic plot
        diag_figures = plot_diagnostics(dataset)

        pp = PdfPages(OUTPUT_FOLDER_PATH / PDF_FOLDER_NAME / (f.stem + ".pdf"))

        for fig in diag_figures:
            fig.savefig(pp, format='pdf')

        pp.close()
