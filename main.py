命令 = ""
basic.pause(2000)
basic.show_icon(IconNames.HEART)
ESP8266.connect_wifi(SerialPin.P2,
    SerialPin.P1,
    BaudRate.BAUD_RATE115200,
    "Redmi_Mini",
    "0987654323")
while not (ESP8266.is_wifi_connected()):
    basic.pause(100)
basic.show_string("W")
Bigiot_net.connect_to_bigiot_server("www.bigiot.net", 8181)
basic.show_string("L")
Bigiot_net.checkout_bigiot("12844", "fb0b41e34")
basic.show_string("O")
Bigiot_net.checkin_bigiot("12844", "fb0b41e34")
basic.show_string("I")

def on_forever():
    global 命令
    basic.pause(200)
    if Bigiot_net.waitfor_command(3000):
        命令 = Bigiot_net.last_cmd()
        basic.show_string(Bigiot_net.last_cmd(), 50)
        if 命令 == "on":
            pins.digital_write_pin(DigitalPin.P16, 1)
        if 命令 == "off":
            pins.digital_write_pin(DigitalPin.P16, 0)
        if 命令 == "play":
            music.set_volume(37)
            music.start_melody(music.built_in_melody(Melodies.PUNCHLINE),
                MelodyOptions.FOREVER_IN_BACKGROUND)
        if 命令 == "stop":
            music.stop_melody(MelodyStopOptions.ALL)
        if 命令 == "down":
            control.reset()
basic.forever(on_forever)

def on_forever2():
    basic.show_leds("""
        . . # . .
        . . . # .
        # # # # #
        . . . # .
        . . # . .
        """)
    basic.clear_screen()
    Bigiot_net.update_bigiot2("12844",
        "11251",
        convert_to_text(input.acceleration(Dimension.Y)),
        "11345",
        convert_to_text(input.acceleration(Dimension.X)))
    basic.pause(5000)
basic.forever(on_forever2)
