from src.reader import Reader

# example file
filename = "data/binaries/BDS_Test_n_5/B150101134132.txt"

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

# save to csv
dataset.to_csv("data/csv/B150101134132.csv", index=False)