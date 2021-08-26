## Preparation
```bash
>cp ./composer/.env.example ./composer/.env
```
*edit `./composer/.env` if you want


## Start
```bash
>./composer/develop.sh up
```


## Stop
```bash
>./composer/develop.sh down
```


## Endpoints
- `GET /tasks`
- `POST /tasks`, body example:
    ```json
    {
        "timeoutInSeconds": 2
    }
    ```

*default port - 3000