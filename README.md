## Project setup

## ENV

```bash
PORT=3000
TYPEORM_HOST="localhost"
TYPEORM_PORT=5432
TYPEORM_USERNAME="iv_user"
TYPEORM_PASSWORD="password9"
TYPEORM_DATABASE="iv_db"
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=
TYPEORM_ENTITIES=
JWT_SECRET="local"
JWT_EXPIRES=10h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USERNAME=email_id
EMAIL_PASSWORD="app_key"
EMAIL_DEFAULT_FROM_MAIL=default_email_id
```

## Create virtual env for python script (Predict)

```bash
python -m venv myvenv 
        (or) 
python[version] -m venv myvenv (ex:- python3.9 -m venv myvenv)
```

## Activating the virtual environment 
```bash
source myvenv/bin/activate
```

## Install the requirements for python scripts
```bash
pip install -r requirements.txt
        (or)
pip[version] install -r requirements.txt (ex:- pip3.9 install -r requirements.txt)
```

## Deactivate a Virtual Environment (Run the command once you close project)

```bash
deactivate
```

## To install client and server packages
```bash
$ npm run deps
```

## Compile and run the both project (Client & Server)

```bash
$ npm run start
```

## Compile and run the client project

```bash
$ npm run start:client
```

## Compile and run the server project

```bash
$ npm run start:server
```
