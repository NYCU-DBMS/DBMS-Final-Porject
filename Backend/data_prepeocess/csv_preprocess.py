import pandas as pd
import numpy as np

file_pathes = ["./data/anime-dataset-2023.csv", "./data/anime-filtered.csv",
               "./data/final_animedataset.csv", "./data/user-filtered.csv",
               "./data/users-details-2023.csv", "./data/users-score-2023.csv"]



for file_path in file_pathes:
    print('preprocess: ', file_path)
    df = pd.read_csv(file_path)
    df.columns = df.columns.str.replace(' ', '_')
    df.replace(['Unknown', 'UNKNOWN'], '', inplace=True)
    print('save prepcoressed data to: ', file_path)
    df.to_csv(file_path, index=False)
