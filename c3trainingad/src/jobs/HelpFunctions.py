def filter_data(input_data):
    import pandas as pd
    df = pd.DataFrame(input_data)
    filtered_df = df.query(filter_condition)
    return filtered_df.to_csv(index=False)