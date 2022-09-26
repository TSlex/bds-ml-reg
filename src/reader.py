from abc import ABC, abstractmethod
from pathlib import Path
import struct
import pandas as pd


class Reader(ABC):

    @classmethod
    @abstractmethod
    def read_from_file(cls, filepath: str, sensor_type="bds100"):
        filepath = Path(filepath).as_posix()
        if sensor_type == "bds100":
            return ReadBDS100().read_from_file(filepath)
        else:
            raise NotImplementedError

    @classmethod
    def _read_from_buffer(cls, filepath, buffer_format):
        with open(filepath, mode="rb") as f:
            buffer = f.read()

        buffer_row_size = struct.calcsize(buffer_format)
        buffer_len = len(buffer)
        buffer_len = buffer_len - buffer_len % buffer_row_size
        buffer = buffer[0:buffer_len]

        data_raw = [x_i for x_i in struct.iter_unpack(buffer_format, buffer)]

        return data_raw


class ReadBDS100(Reader):
    def __init__(self) -> None:
        super().__init__()

    def read_from_file(self, filepath: str, **kwargs):
        buffer_format = "HI22f4B"
        data_raw = super()._read_from_buffer(filepath, buffer_format)

        data_columns = [
            "Sample Rate",
            "Timestamp",
            "Press.Left", "Temp.Left",
            "Press.Center", "Temp.Center",
            "Press.Right", "Temp.Right",
            "Euler.X", "Euler.Y", "Euler.Z",
            "Quat.W", "Quat.X", "Quat.Y", "Quat.Z",
            "Magnet.X", "Magnet.Y", "Magnet.Z",
            "Accel.X", "Accel.Y", "Accel.Z",
            "Gyro.X", "Gyro.Y", "Gyro.Z",
            "Cal.Magnet", "Cal.Accel", "Cal.Gyro", "Cal.SUMMARY",
        ]

        return pd.DataFrame(data_raw, columns=data_columns)
