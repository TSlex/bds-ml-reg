from pathlib import Path
from src.reader import Reader

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


if __name__ == '__main__':
    INPUT_FOLDER_PATH.mkdir(parents=True, exist_ok=True)
    (OUTPUT_FOLDER_PATH / CSV_FOLDER_NAME).mkdir(parents=True, exist_ok=True)
    (OUTPUT_FOLDER_PATH / PDF_FOLDER_NAME).mkdir(parents=True, exist_ok=True)

    for f in INPUT_FOLDER_PATH.glob("*.txt"):
        dataset = import_file(f.as_posix())
        dataset.to_csv(OUTPUT_FOLDER_PATH / CSV_FOLDER_NAME / (f.stem + ".csv"), index=False)
