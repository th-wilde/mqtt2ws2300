# mqtt2ws2300
Hooks up a quite old "WS2300"-model weather station to MQTT

## How to use
1. Be `root`
1. Install `nodejs` on jour raspberry pi
3. Adjust [`config.json`](https://github.com/th-wilde/mqtt2ws2300/blob/cfb84468f1d7e5b8413f05143b63485150b5a18f/config.json) to your needs 
4. Change directory into the repository and run `/usr/bin/npm start`
5. Check if it works. Stop execution witch `Ctrl+C`. Adjust whatever needed if an problem occur and try again with step 4. If everything is fine, continue with step 6.
6. Create systemd-service-unit-file at `/etc/systemd/system/mqtt2ws2300.service` with follwing content:
```ini
[Unit]
Description=mqtt2ws2300 Bridge
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/repository/mqtt2ws2300 #<--- adjust to match your environment
ExecStart=/usr/bin/npm start
User=pi
SendSIGKILL=no
Restart=on-failure

[Install]
WantedBy=multi-user.target

```
7. Reload systemd serice deamon with `systemctl daemon-reload`
8. Enable the mqtt2rf service with `systemctl enable mqtt2ws2300`
9. Start the mqtt2rf service with `systemctl start mqtt2ws2300`
