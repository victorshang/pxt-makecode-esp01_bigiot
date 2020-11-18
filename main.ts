let 命令 = ""
let sleeptime=5000
let next=0
basic.pause(2000)
basic.showIcon(IconNames.Heart)
ESP8266.connectWifi(SerialPin.P2, SerialPin.P1, BaudRate.BaudRate115200, "MERCURY_Mini", "0987654323")
basic.showString("W")
Bigiot_net.connectToBigiotServer("www.bigiot.net", 8181)
basic.showString("L")
Bigiot_net.checkoutBigiot("12844", "fb0b41e34")
basic.showString("O")
Bigiot_net.checkinBigiot("12844", "fb0b41e34")
if(Bigiot_net.isLastCmdSuccessful()){
    basic.showString("I")
}
next = control.millis()
basic.forever(function on_forever2() {
    if(control.millis()-next>sleeptime){
        basic.showLeds(`
            . . # . .
            . . . # .
            # # # # #
            . . . # .
            . . # . .
            `)
        basic.clearScreen()
        Bigiot_net.updateBigiot2("12844", "11251", convertToText(input.acceleration(Dimension.Y)), "11345", convertToText(input.acceleration(Dimension.X)))
        next = control.millis()
    }
    if (Bigiot_net.getCommand(500)) {
        命令 = Bigiot_net.lastCmd()
        basic.showString(Bigiot_net.lastCmd(), 50)
        if (命令 == "on") {
            pins.digitalWritePin(DigitalPin.P16, 1)
        }
        
        if (命令 == "off") {
            pins.digitalWritePin(DigitalPin.P16, 0)
        }
        
        if (命令 == "play") {
            music.setVolume(37)
            music.startMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.ForeverInBackground)
        }
        
        if (命令 == "stop") {
            music.stopMelody(MelodyStopOptions.All)
        }
        
        if (命令 == "down") {
            control.reset()
        }
        if (命令 == "ERROR") {
            control.reset()
        }
    }
})
