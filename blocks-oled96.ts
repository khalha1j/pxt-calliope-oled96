/**
 * Provides functions to control the Grove OLED 0.96" from a Calliope Mini.
 */
//% color=#fabe58 icon="\uf108" block="Grove OLED"
namespace oled96 {
    /**
     * Resets the display and clears it.
     * Should be used at the start of the program.
     */
    //% blockId=oled96_init_display
    //% block="initialize display"
    export function initDisplay(): void {
        cmd(DISPLAY_OFF);
        cmd(0x20);
        cmd(0x00);
        cmd(COM_SCAN_DEC);
        cmd(0xA1);
        cmd(DISPLAY_ON);
        cmd(NORMAL_DISPLAY);
        clearDisplay();
    }

    /**
     * Clears the whole display.
     */
    //% blockId=oled96_clear_display
    //% block="clear display"
    export function clearDisplay() {
        cmd(DISPLAY_OFF);   //display off
        for (let j = 0; j < 8; j++) {
            setTextXY(j, 0);
            {
                for (let i = 0; i < 16; i++)  //clear all columns
                {
                    putChar(' ');
                }
            }
        }
        cmd(DISPLAY_ON);    //display on
        setTextXY(0, 0);
    }

    /**
     * Clears a range of characters, beginning from the current
     * cursor position.
     * @param n Number of characters to delete
     */
    //% blockId=oled96_clear_range
    //% block="clear %n|characters"
    export function clearRange(n: number) {
        for (let i = 0; i < n; i++) {
            putChar(' ');
        }
    }

    /**
     * Move the cursor to a new position.
     */
    //% blockId=oled96_set_text
    //% block="set display cursor to|row %row|and column %column"
    export function setTextXY(row: number, column: number) {
        let r = row;
        let c = column;
        if (row < 0) { r = 0 }
        if (column < 0) { c = 0 }
        if (row > 7) { r = 7 }
        if (column > 15) { c = 15 }

        cmd(0xB0 + r);            //set page address
        cmd(0x00 + (8 * c & 0x0F));  //set column lower address
        cmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address
    }

    /**
     * Writes a single character to the display.
     */
    function putChar(c: string) {
        let c1 = c.charCodeAt(0);
        if (c1 < 32 || c1 > 127) //Ignore non-printable ASCII characters. This can be modified for multilingual font.
        {
            console.log("c1:" +  c1);
        } else {
            //writeCustomChar(basicFont[c1 - 32]);
            writeCustomChar(basicFont[c1 - 32]);
        }
    }

    function putCharArabic(c: string, pos: number) {
    let c1 = c.charCodeAt(0);
    if (c1 < 32 || c1 > 127) //Ignore non-printable ASCII characters. This can be modified for multilingual font.
    {
        console.log("c1:" +  c1);
    } else {
        //writeCustomChar(basicFont[c1 - 32]);
        if(pos == 0)
        {  
            writeCustomChar(basicFont_arabic[c1 - 32]);
        }
        if(pos == 2)
        {   
            writeCustomChar(basicFont_arabic[c1 - 32]);
        }
    }
}

    
    /**
     * Writes a string to the display at the current cursor position.
     */
    //% blockId=oled96_write_string
    //% block="write %s|to display"
    export function writeString(s: string) {
        let pos: number =0;
       for( let c_index =  (s.length-1); c_index >=0; c_index-- ) {
            //for (let j = 0; j < 8; j++) {
            //for (let c of s) {
           let c = s.charAt(c_index);
           putCharArabic(c, pos);
           if(c_index >  1 &&  c_index ){//put next as last char
              
               let c_next = s.charAt(c_index);
               if( c_next == ' ')
               {
                    pos = 0;// first letter again unless...
               }
               else
               {
                   pos = 1;// mid letter unless...
               }
               
           }
           if(c == ' ' ){//put next as first char
                pos = 0;

           }
           if(c_index == 1 ){//put next as last char
                pos = 2;
           }


           /*
           if(c_index ==  (s.length-1) ){//put next as first char
                putCharArabic(c, 0);
           }
           if(c_index ==  0 ){//put next as last char
                putCharArabic(c, 2);
           }
           if(c_index !=  (s.length-1) && c_index != 0) {//mid
                putCharArabic(c,1);   
           }
           if(c == ' '){//put next as first char again
                putCharArabic(c,0);
               
               //pos = 0;
           }
           */
           
            
        }
        //console.log("s0:" +  s.charCodeAt(0));
    }

    /**
     * Changes the display to white characters on a black background.
     */
    //% blockId=oled96_normal_display
    //% block="set display to white on black"
    export function normalDisplay() {
        cmd(NORMAL_DISPLAY);
    }

    /**
     * Changes the display to black characters on a white background.
     */
    //% blockId=oled96_invert_display
    //% block="set display to black on white"
    export function invertDisplay() {
        cmd(INVERT_DISPLAY);
    }

    /**
     * Flips the display upside down.
     */
    //% blockId=oled96_flip_screen
    //% block="flip display"
    export function flipScreen() {
        cmd(DISPLAY_OFF);
        cmd(COM_SCAN_INC);
        if (flipped) {
            cmd(0xA1)
        } else {
            cmd(0xA0);
        }
        cmd(DISPLAY_ON);
    }

    /**
     * Changes the brightness of the display. Values range from 0 to 255.
     */
    //% blockId=oled96_set_brightness
    //% block="set display brightness|to %brightness"
    export function setDisplayBrightness(brightness: number) {
        let b = brightness
        if (b < 0) {
            b = 0;
        }
        if (b > 255) {
            b = 255;
        }
        cmd(0x81);
        cmd(b);
    }

    /**
     * Turns the display off.
     */
    //% blockId=oled96_turn_off
    //% block="turn display off"
    export function turnOff() {
        cmd(DISPLAY_OFF);
    }

    /**
     * Turns the display on.
     */
    //% blockId=oled96_turn_on
    //% block="turn display on"
    export function turnOn() {
        cmd(DISPLAY_ON);
    }

    /**
     * Writes a custom character to the display
     * at the current cursor position.
     * A character is a string of 8 bytes. Each byte represesnts
     * a line of the character. The eight bits of each byte
     * represent the pixels of a line of the character.
     * Ex. "\x00\xFF\x81\x81\x81\xFF\x00\x00"
     */
    //% blockId=oled96_write_custom_char
    //% block="write custom character %c"
    export function writeCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            writeData(c.charCodeAt(i));
        }
    }

    /**
     * Sends a command to the display.
     * Only use this, if you know what you are doing.
     * 
     * For valid commands refer to the documentation of
     * the SSD1308.
     */
    //% blockId=oled96_send_command
    //% block="send command %c|to display"
    export function cmd(c: number) {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }

    /**
     * Writes a byte to the display.
     * Could be used to directly paint to the display.
     */
    //% blockId=oled96_write_data
    //% block="send data %n|to display"
    export function writeData(n: number) {
        let b = n;
        if (n < 0) { n = 0 }
        if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
    }
}

let flipped = false;

const DISPLAY_OFF = 0xAE;
const DISPLAY_ON = 0xAF;
const SET_DISPLAY_CLOCK_DIV = 0xD5;
const SET_MULTIPLEX = 0xA8;
const SET_DISPLAY_OFFSET = 0xD3;
const SET_START_LINE = 0x00;
const CHARGE_PUMP = 0x8D;
const EXTERNAL_VCC = false;
const MEMORY_MODE = 0x20;
const SEG_REMAP = 0xA1; // using 0xA0 will flip screen
const COM_SCAN_DEC = 0xC8;
const COM_SCAN_INC = 0xC0;
const SET_COM_PINS = 0xDA;
const SET_CONTRAST = 0x81;
const SET_PRECHARGE = 0xd9;
const SET_VCOM_DETECT = 0xDB;
const DISPLAY_ALL_ON_RESUME = 0xA4;
const NORMAL_DISPLAY = 0xA6;
const COLUMN_ADDR = 0x21;
const PAGE_ADDR = 0x22;
const INVERT_DISPLAY = 0xA7;
const ACTIVATE_SCROLL = 0x2F;
const DEACTIVATE_SCROLL = 0x2E;
const SET_VERTICAL_SCROLL_AREA = 0xA3;
const RIGHT_HORIZONTAL_SCROLL = 0x26;
const LEFT_HORIZONTAL_SCROLL = 0x27;
const VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29;
const VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A;

const basicFont: string[] = [
    "\x00\x00\x00\x00\x00\x00\x00\x00", // " "  0
    "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"  1   ء
    "\x00\x00\x07\x00\x07\x00\x00\x00", // """  2   آ
    "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"  3   أ
    "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"  4   ؤ
    "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"  5   إ
    "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"  6   ئ
    "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"  7   ا
    "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("  8   ب
    "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"  9   ة
    "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"  10  ت
    "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"  11  ث
    "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","  12  ج
    "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"  13  ح
    "\x00\x60\x60\x00\x00\x00\x00\x00", // "."  14  خ
    "\x00\x00\x20\x24\x28\x10\x00\x00", // "/"  15  د
    "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"  16  ذ
    "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"  17  ر
    "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"  18  ز
    "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"  19  س
    "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"  20  ش
    "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"  21  ص
    "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"  22  ض
    "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"  23  ط
    "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"  24  ظ
    "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"  25  ع
    "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"  26  غ
    "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"  27  
    "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"  28  
    "\x00\x14\x14\x14\x14\x14\x00\x00", // "="  29  
    "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"  30
    "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"  31
    "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"  32  ـ   مدة
    "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"  33  ف
    "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"  34  ق
    "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"  35  ك
    "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"  36  ل
    "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"  37  م
    "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"  38  ن
    "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"  39  هـ
    "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"  40  و
    "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"  41  ى
    "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"  42  ي
    "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"  43  تنوين فتح ً
    "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"  44  تنوين ضم  ٌ
    "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"  45
    "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"  46 َفتحة
    "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"  47  ضمة ُ
    "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"  48  كسرة  ِ
    "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"  49 تنوين كسر  ٍ
    "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"  50  سكون  ْ
    "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
    "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
    "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
    "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
    "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"  55
    "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
    "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
    "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
    "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
    "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"  60
    "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
    "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
    "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
    "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
    "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"  65
    "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
    "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
    "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
    "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"  70
    "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
    "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
    "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
    "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
    "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"  75
    "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
    "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
    "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
    "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
    "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"  80
    "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
    "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
    "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
    "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
    "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"  85
    "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
    "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
    "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
    "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
    "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"  90
    "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"  91
    "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"  92
    "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"  93
    "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"  94
    "\x00\x02\x01\x01\x02\x01\x00\x00" // "~"   95
];

    ///////////////////////////////
const basicFont_arabic: string[] = [
    "\x00\x00\x00\x00\x00\x00\x00\x00", // " "  0
    "\x00\x00\x20\x30\x28\x00\x00\x00", // "!"  1   ء
    "\x03\x01\x02\x03\x00\x3F\x00\x00", // """  2   آ
    "\x00\x04\x06\x05\x00\x3F\x00\x00", // "#"  3   أ
    "\x04\x07\x45\x40\x44\x2A\x1E\x00", // "$"  4   ؤ
    "\x10\x24\x26\x25\x20\x1F\x00\x00", // "%"  5   إ
    "\x34\x67\x45\x40\x4C\x2A\x12\x00", // "&"  6   ئ
    "\x00\x00\x00\x00\x00\x3F\x00\x00", // "'"  7   ا
    "\x38\x20\x20\x20\xA0\x20\x20\x38", // "("  8   ب
    "\x00\x00\x1D\x24\x25\x18\x00\x00", // ")"  9   ة
    "\x38\x20\x20\x22\x20\x22\x20\x38", // "*"  10  ت
    "\x18\x20\x20\x22\x21\x22\x20\x18", // "+"  11  ث
    "\x00\x70\x8A\xAA\x8A\x44\x00\x00", // ","  12  ج
    "\x00\x70\x8A\x8A\x8A\x44\x00\x00", // "-"  13  ح
    "\x00\x70\x8A\x8A\x8A\x44\x01\x00", // "."  14  خ
    "\x00\x00\x20\x24\x28\x10\x00\x00", // "/"  15  د
    "\x00\x00\x20\x24\x28\x12\x00\x00", // "0"  16  ذ
    "\x00\x40\x40\x40\x20\x18\x00\x00", // "1"  17  ر
    "\x00\x40\x40\x40\x20\x1A\x00\x00", // "2"  18  ز
    "\x38\x40\x40\x38\x20\x38\x20\x18", // "3"  19  س
    "\x38\x40\x40\x38\x22\x39\x22\x18", // "4"  20  ش
    "\x38\x40\x40\x38\x30\x28\x24\x18", // "5"  21  ص
    "\x38\x40\x40\x38\x32\x28\x24\x18", // "6"  22  ض
    "\x00\x20\x20\x3F\x30\x28\x24\x18", // "7"  23  ط
    "\x00\x20\x20\x3F\x30\x28\x25\x18", // "8"  24  ظ
    "\x00\x70\x88\x8E\x89\x8A\x00\x00", // "9"  25  ع
    "\x00\x71\x88\x8E\x89\x8A\x00\x00", // ":"  26  غ
    "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"  27  
    "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"  28  
    "\x00\x14\x14\x14\x14\x14\x00\x00", // "="  29  
    "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"  30
    "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"  31
    "\x00\x00\x20\x20\x20\x20\x00\x00", // "@"  32  ـ   مدة
    "\x1C\x20\x20\x22\x20\x2C\x2A\x1C", // "A"  33  ف
    "\x78\xC2\x80\x82\x98\xD4\x7C\x00", // "B"  34  ق
    "\x18\x20\x28\x2E\x2A\x20\x1F\x00", // "C"  35  ك
    "\x00\x00\x00\x18\x20\x20\x1F\x00", // "D"  36  ل
    "\x00\x00\xF0\x10\x18\x14\x1C\x00", // "E"  37  م
    "\x78\xC0\x80\x82\x80\xC0\x78\x00", // "F"  38  ن
    "\x00\x00\x1C\x24\x24\x18\x00\x00", // "G"  39  هـ
    "\x00\x00\x40\xC0\xC4\x6A\x1E\x00", // "H"  40  و
    "\x1C\x30\xA0\x20\xA6\x15\x09\x00", // "I"  41  ى
    "\x1C\x30\xA0\x20\xA6\x15\x09\x00", // "J"  42  ي
    "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"  43  تنوين فتح ً
    "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"  44  تنوين ضم  ٌ
    "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"  45
    "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"  46 َفتحة
    "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"  47  ضمة ُ
    "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"  48  كسرة  ِ
    "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"  49 تنوين كسر  ٍ
    "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"  50  سكون  ْ
    "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
    "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
    "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
    "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
    "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"  55
    "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
    "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
    "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
    "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
    "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"  60
    "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
    "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
    "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
    "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
    "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"  65
    "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
    "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
    "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
    "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"  70
    "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
    "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
    "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
    "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
    "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"  75
    "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
    "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
    "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
    "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
    "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"  80
    "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
    "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
    "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
    "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
    "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"  85
    "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
    "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
    "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
    "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
    "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"  90
    "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"  91
    "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"  92
    "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"  93
    "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"  94
    "\x00\x02\x01\x01\x02\x01\x00\x00" // "~"   95
];
