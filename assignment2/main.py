from flask import Flask, request, jsonify
import time, requests
import json ,os, pytz
from datetime import datetime

#add a line here to rebuild from the gcloud
app = Flask(__name__)

SIZE = 10
TYPE = 'artist'
TOKENS = None
EXPIRE = None

def get_token():
    global TOKENS, EXPIRE

    def read_tokens(file_path):
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                data = json.load(file)
            return data
        else:
            return {}

    def write_tokens(file_path, data):
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)

    def is_token_expired(expire_time_str):
        expire_time = datetime.fromisoformat(expire_time_str)
        current_time = datetime.now(pytz.utc)
        return current_time >= expire_time

    def get_new_token():
        url = 'https://api.artsy.net/api/tokens/xapp_token'
        with open('client_data.json', 'r') as file:
            client_data = json.load(file)
        client_id = client_data['client_id']
        client_secret = client_data['client_secret']
        params = {'client_id': client_id, 'client_secret': client_secret}

        response = requests.post(url, params=params).json()
        new_token = response['token']
        new_expire_time = response['expires_at']

        tokens_data = read_tokens(file_path)
        tokens_data[token_key] = {'token': new_token, 'expire': new_expire_time}
        write_tokens(file_path, tokens_data)
        return new_token, new_expire_time

    file_path = 'tokens.json'
    data = read_tokens(file_path)
    token_key = 'token'

    if token_key in data:
        if is_token_expired(data[token_key]['expire']):
            TOKENS, EXPIRE = get_new_token()
            return TOKENS
        else:
            TOKENS = data[token_key]['token']
            EXPIRE = data[token_key]['expire']
            return TOKENS


@app.route('/')
def home():
    # return render_template('index.html')
    # not using render_template but instead send_static_file
    return app.send_static_file('index.html')


# change to use GET method instead of POST
# @app.route('/process', methods=['POST'])
# def process():
#     data = request.get_json()
#     user_input = data.get('input', '')
#     TOKENS = get_token()
#     if not all([TOKENS, SIZE, TYPE]):
#         raise ValueError("TOKENS, SIZE, or TYPE not defined")

#     def artsy_get_request(query):
#         url = 'https://api.artsy.net/api/search'
#         params = {'q': query, 'size': SIZE, 'type': TYPE}
#         headers = {'X-XAPP-Token': TOKENS}

#         response = requests.get(url, params=params, headers=headers)
#         # response.raise_for_status()
#         return response.json()

#     output = artsy_get_request(user_input) ["_embedded"]["results"]
#     ans = []
#     for i in output:
#         id = i["_links"]["self"]["href"].split('/')[-1]
#         name = i["title"]
#         image = i["_links"]["thumbnail"]["href"]
#         ans.append({"id": id, "name": name, "image": image})
#     return jsonify({'status': 'success', 'output': ans})

@app.route('/artist_search/<string:query>', methods=['GET'])
def artist_search(query):
    TOKENS = get_token()
    def artsy_get_request(query):
        url = 'https://api.artsy.net/api/search'
        params = {'q': query, 'size': SIZE, 'type': TYPE}
        headers = {'X-XAPP-Token': TOKENS}

        response = requests.get(url, params=params, headers=headers)
        return response.json()
    output = artsy_get_request(query)["_embedded"]["results"]

    # doing some data processing before returning to frontend
    ans = []
    for i in output:
        id = i["_links"]["self"]["href"].split('/')[-1]
        name = i["title"]
        image = i["_links"]["thumbnail"]["href"]
        ans.append({"id": id, "name": name, "image": image})
    return jsonify({'status': 'success', 'output': ans})


# change to use GET method instead of POST
# @app.route('/details', methods=['POST'])
# def detail():
#     data = request.get_json()
#     id = data.get('id', '')
#     TOKENS = get_token()
#     # Ensure required variables are defined
#     if not all([TOKENS, SIZE, TYPE]):
#         raise ValueError("TOKENS, SIZE, or TYPE not defined")

#     def artsy_get_request(id):
#         url = f'https://api.artsy.net/api/artists/{id}'
#         headers = {'X-XAPP-Token': TOKENS}

#         response = requests.get(url, headers=headers)
#         return response.json()
#     output = artsy_get_request(id)
#     ans = {}
#     alternative = []
#     name = output["name"]
#     birthday = output["birthday"]
#     if birthday == "":
#         alternative += ["No Birth Year"]
#     deathday = output["deathday"]
#     if deathday == "":
#         alternative += ["No Death Year"]
#     nationality = output["nationality"]
#     if nationality == "":
#         alternative += ["No Nationality"]
#     biography = output["biography"]
#     if biography == "":
#         alternative += ["No Biography"]
#     ans["first_line"] = f'{name} ({birthday} - {deathday})'
#     ans["nationality"] = f'{nationality}'
#     ans["biography"] = f'{biography}'
#     if alternative != []:
#         ans["alternative"] = (', ').join(alternative)
#     else :
#         ans["alternative"] = None
#     return jsonify({'status': 'success', 'output': ans})

@app.route('/artist_detail/<string:id>', methods=['GET'])
def artist_detail(id):
    TOKENS = get_token()

    def artsy_get_request(id):
        url = f'https://api.artsy.net/api/artists/{id}'
        headers = {'X-XAPP-Token': TOKENS}

        response = requests.get(url, headers=headers)
        return response.json()

    output = artsy_get_request(id)
    ans = {}
    alternative = []
    name = output["name"]

    birthday = output["birthday"]
    if birthday == "":
        alternative += ["No Birth Year"]

    deathday = output["deathday"]
    if deathday == "":
        alternative += ["No Death Year"]

    ans["first_line"] = f'{name} ({birthday} - {deathday})'

    nationality = output["nationality"]
    if nationality == "":
        alternative += ["No Nationality"]
    ans["nationality"] = f'{nationality}'

    biography = output["biography"]
    if biography == "":
        alternative += ["No Biography"]

    ans["biography"] = f'{biography}'

    if alternative != []:
        ans["alternative"] = (', ').join(alternative)
    else :
        ans["alternative"] = None

    return jsonify({'status': 'success', 'output': ans})


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8080, debug=True)