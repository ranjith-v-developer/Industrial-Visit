## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start
```

## Env Details

```
.env.development

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
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_DEFAULT_FROM_MAIL=
```
## If you use predict run below cmd

```
python3 -m venv venv
source venv/bin/activate
sample test:- python3 server/python_scripts/predict.py "Give me data about avadi"
```