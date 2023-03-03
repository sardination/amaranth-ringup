# Amaranth Ringup

## Local Dev
* `php -S 127.0.0.1:8000` from `api` folder
* `ng serve --proxy-config proxy-local.config.js --serve-path ringup` from `frontend` folder
* `api/credentials.php`: create a file with the following format:
    ```
    <?php
    // This should be present on every system with the appropriate credentials, but
    // NOT pushed to version control.
    $username = "<username>";
    $password = "<password>";
    $dbname = "<dbname>";
    ?>
    ```

## Build Prod
* In the `frontend` folder, run `ng build --optimization true --base-href /ringup/`. This will output all the frontend bundles to the `frontend/dist` folder. These are the files that should be copied directly into the `ringup/` folder on CPanel.
* In the `api` folder, modify the following files:
    * `credentials.php`: create a file with the following format:
    ```
    <?php
    // This should be present on every system with the appropriate credentials, but
    // NOT pushed to version control.
    $username = "<username>";
    $password = "<password>";
    $dbname = "<dbname>";
    ?>
    ```
    * `.htaccess`: comment out the dev `Access-Control-Allow-Origin` header and uncomment the prod header
    * `LoginController.php` : make sure that `$username_hash` and `$password_hash` are set to the hashes of the desired login credentials. DO NOT push this to version control.
* Copy all contents of the `api` folder to the `ringup/api` folder on CPanel.

## Test Prod Locally
* In `frontend/src/environments/environment.prod.ts`, uncomment the line for `apiBase` that is meant for testing prod locally and comment out the one meant for actual prod.
* In the `frontend` folder, run `ng build --prod --optimization true --base-href`. This will output all the frontend bundles to the `frontend/dist` folder.
* In `api/.htaccess`, replace `localhost:4200` from the `Access-Control-Allow-Origin` header with `localhost:8000`
* `php -S 127.0.0.1:8000` from `api` folder
* Launch `frontend/dist/amaranth-ringup/index.html` from your browser
