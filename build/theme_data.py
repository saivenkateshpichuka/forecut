import json
T = {tuple(k.split("|", 1)): v for k, v in json.load(open("themes.json")).items()}
