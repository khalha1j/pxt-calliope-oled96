/**
 * Provides functions to control the Grove OLED 0.96" from a Calliope Mini.
 */
//% color=#fabe58 icon="\uf108" block="pinky OLED"
namespace oled96 {

    let _rawHeight = 64;
    let _rawWidth = 128;
    let flipped = false;

    const EXTERNALVCC = 0x1;
    const SWITCHCAPVCC = 0x2;
    const COLUMNADDR = 0x21;
    const PAGEADDR = 0x22;
    const SETCONTRAST = 0x81;
    const DISPLAYALLON_RESUME = 0xA4;
    const DISPLAYALLON = 0xA5;
    const NORMALDISPLAY = 0xA6;
    const INVERTDISPLAY = 0xA7;
    const DISPLAYOFF = 0xAE;
    const DISPLAYON = 0xAF;
    const SETDISPLAYOFFSET = 0xD3;
    const SETCOMPINS = 0xDA;
    const SETVCOMDETECT = 0xDB;
    const SETDISPLAYCLOCKDIV = 0xD5;
    const SETPRECHARGE = 0xD9;
    const SETMULTIPLEX = 0xA8;
    const SETLOWCOLUMN = 0x00;
    const SETHIGHCOLUMN = 0x10;
    const SETSTARTLINE = 0x40;
    const MEMORYMODE = 0x20;
    const COMSCANINC = 0xC0;
    const COMSCANDEC = 0xC8;
    const SEGREMAP = 0xA0;
    const CHARGEPUMP = 0x8D;



    const SET_START_LINE = 0x00;
    const EXTERNAL_VCC = false;
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

    /**
     * Resets the display and clears it. hak1.22
     * Should be used at the beginning the program.
     */
    //% blockId=oled96_init_display
    //% block="initialize display"
    export function initDisplay(): void {
        /*cmd(DISPLAY_OFF);
        cmd(0x20);
        cmd(0x00);
        cmd(COM_SCAN_DEC);
        cmd(0xA1);
        cmd(DISPLAY_ON);
        cmd(NORMAL_DISPLAY);
        clearDisplay();*/
        let vccstate = 0x2;
        const EXTERNALVCC = 0x1;
        cmd(DISPLAYOFF);
        cmd(SETDISPLAYCLOCKDIV);
        cmd(0x80);                                  // the suggested ratio 0x80
        cmd(SETMULTIPLEX);
        cmd(_rawHeight - 1);
        cmd(SETDISPLAYOFFSET);
        cmd(0x0);                                   // no offset
        cmd(SETSTARTLINE | 0x0);            // line #0
        cmd(CHARGEPUMP);
        cmd((vccstate == EXTERNALVCC) ? 0x10 : 0x14);
        cmd(MEMORYMODE);
        cmd(0x00);                                  // 0x0 act like ks0108
        cmd(SEGREMAP | 0x1);
        cmd(COMSCANDEC);
        cmd(SETCOMPINS);
        cmd(_rawHeight == 32 ? 0x02 : 0x12);        // TODO - calculate based on _rawHieght ?
        cmd(SETCONTRAST);
        cmd(_rawHeight == 32 ? 0x8F : ((vccstate == EXTERNALVCC) ? 0x9F : 0xCF));
        cmd(SETPRECHARGE);
        cmd((vccstate == EXTERNALVCC) ? 0x22 : 0xF1);
        cmd(SETVCOMDETECT);
        cmd(0x40);
        cmd(DISPLAYALLON_RESUME);
        cmd(NORMALDISPLAY);
        cmd(DISPLAYON);
        clearDisplay();
        display();
    }

    function display() {
        cmd(SETLOWCOLUMN | 0x0);  // low col = 0
        cmd(SETHIGHCOLUMN | 0x0);  // hi col = 0
        cmd(SETSTARTLINE | 0x0); // line #0
        //sendDisplayBuffer();

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
            writeCustomChar("\x00\xFF\x81\x81\x81\xFF\x00\x00");
        } else {
            writeCustomChar(basicFont_english[c1 - 32]);
        }
    }

    function putCharArabic(c: string, pos: number) {
        let c1 = c.charCodeAt(0);
        if (c1 < 32 || c1 > 127) //Ignore non-printable ASCII characters. This can be modified for multilingual font.
        {
            console.log("c1:" + c1);
        } else {
            //writeCustomChar(basicFont[c1 - 32]);
            if (pos == 0) {//ending
                writeCustomChar(basicFont_arabic_ending[c1 - 32]);
            }
            if (pos == 1) {//mid
                writeCustomChar(basicFont_arabic_mid[c1 - 32]);
            }
            if (pos == 2) {//ending
                writeCustomChar(basicFont_arabic_starting[c1 - 32]);
            }
            if (pos == 3) {//separate
                writeCustomChar(basicFont_arabic_separate[c1 - 32]);
            }
        }
    }


    /**
    * Writes a HAK 2.38 string to the display at the current cursor position.
    */
    //% blockId=oled96_write_string
    //% block="write %s|to display"
    export function writeString(s: string) {
        let pos = 0;
        let useless = 0;
        let posNext = 0;
        let posPrev = 0;
        for (let c_index = (s.length - 1); c_index >= 0; c_index--) {


            let c = s.charAt(c_index);


            if ((c_index - 1) >= 0) {
                posNext = (c_index - 1);
            }
            if ((c_index + 1) < s.length) {
                posPrev = (c_index + 1);
            }

            //START

            if (c_index > 0 && c_index < (s.length - 1)) {//any letter not first and not last in statement
                if (s.charAt(posPrev) == ' ' && s.charAt(posNext) == ' ') {
                    pos = 3;//separate
                } else if (s.charAt(posPrev) == ' ') {
                    pos = 0;//first 
                } else if (s.charAt(posNext) == ' ') {
                    pos = 2;//last
                } else {
                    pos = 1;//mid  
                }
            }


            //guaranteed shapes
            if (c_index == (s.length - 1)) {//put next as first char
                if (s.charAt(posNext) == ' ') {
                    pos = 2; //last
                } else {
                    pos = 0; //first
                }
            }
            if (c_index == 0) {//put next or first as last char
                if (s.charAt(posPrev) == ' ') {
                    pos = 3;//separate
                } else {
                    pos = 2; //last
                }
            }

            //END
            putCharArabic(c, pos);
            //putChar(c);

        }
    }



    /**
     * Draw a horizontal line v2.226 12
     * @param x  eg, 1
     * @param y eg, 1
     * @param data eg, 1
     */
    //% blockId=grove_oled_draw_pixel 
    //% block="Draw pixel point at x %x| and y %y| and data %data|"
    //% y.min=0 y.max=128
    //% x.min=0 x.max=64
    //% data.min=0 data.max=16
    export function drawPixel(x: number, y: number, data: number) {
        if (x < 0) x = 0;
        else if (x > 127) x = 127;
        if (y < 0) y = 0;
        else if (y > 127) y = 127;
        if (data < 0) data = 0;
        else if (data > 255) data = 255;
        setTextXY(x / 8, y / 8);
        writeData(data);
    }



    /**
     * Draw a horizontal line v2.225
     * @param x  
     * @param y
     * @param len
     */
    //% blockId=grove_oled_draw_hline block="%oled|Draw horizontal line start at x|%x|and y|%y|, length|%len|"
    //% y.min=0 y.max=128
    //% x.min=0 x.max=64
    //% len.min=1 len.max=128
    export function drawHLine(x: number, y: number, len: number) {
        let y_max = y + len;
        if (y_max > 128) y_max = 128;
        for (let i = y; i < y_max; i++) {
            drawPixel(x, i, 0x01 << (x % 8));
        }
    }


    /**
     * Draw a vertical line
     * @param x  
     * @param y
     * @param len
     */
    //% blockId=grove_oled_draw_vline block="%oled|Draw vertical line start at x|%x|and y|%y|, length|%len|"
    //% y.min=0 y.max=128
    //% x.min=0 x.max=64
    //% len.min=1 len.max=128
    export function drawVLine(x: number, y: number, len: number) {
        let x_min = 0, x_max = 0;
        x_min = Math.floor((x / 8));
        x_max = x + len;
        x_min = x_min * 8;
        if (x_max > 128) x_max = 128;
        while ((x_max % 8) != 0) {
            x_max++;
        }

        let last_bit = 0xff;
        for (let i = 0; i < (x_max - x - len); i++) {
            last_bit = last_bit - (0x01 << (7 - i));
        }
        let first_bit = 0xff;
        for (let i = 0; i < (x - x_min); i++) {
            first_bit = first_bit - (0x01 << i);
        }

        if (x_max - x_min > 16) {
            drawPixel(x_min, y, first_bit);
            for (let i = x_min + 8; i < x_max - 8; i = i + 8) {
                drawPixel(i, y, 0xff);
            }
            drawPixel(x_max - 1, y, last_bit);
        }
        else if (x_max - x_min == 16) {
            drawPixel(x_min, y, first_bit);
            drawPixel(x_max - 1, y, last_bit);
        }
        else {
            drawPixel(x_min, y, (first_bit & last_bit));
        }
    }

    /**
     * Draw any line line v2.444
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     */
    //% blockId=grove_oled_draw_line block="%oled|Draw line start at x0|%x0|and y0|%y|and ends at x1|%x1|and y1|%y1|"
    //% y0.min=0 y0.max=128
    //% x0.min=0 x0.max=64
    //% y1.min=0 y1.max=128
    //% x1.min=0 x1.max=64
    export function drawLine(x0: number, y0: number, x1: number, y1: number) {
        let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

        if (steep) {
            x0 = x0 + y0;
            y0 = x0 - y0;
            x0 = x0 - y0;

            //swap(x0, y0);
            x1 = x1 + y1;
            y1 = x1 - y1;
            x1 = x1 - y1;

            //swap(x1, y1);
        }

        if (x0 > x1) {
            x0 = x0 + x1;
            x1 = x0 - x1;
            x0 = x0 - x1;

            //swap(x0, x1);

            y0 = y0 + y1;
            y1 = y0 - y1;
            y0 = y0 - y1;
            //swap(y0, y1);
        }

        let dx = x1 - x0;
        let dy = Math.abs(y1 - y0);

        let err = dx / 2;
        let ystep = 0;

        if (y0 < y1)
            ystep = 1;
        else
            ystep = -1;

        for (; x0 <= x1; x0++) {
            if (steep)
                drawPixel(y0, x0, 0x01 << (y0 % 8));
            else
                drawPixel(x0, y0, 0x01 << (x0 % 8));

            err -= dy;
            if (err < 0) {
                y0 += ystep;
                err += dx;
            }
        }
    }




    /**
     * Draw a rectangle 2.333
     * @param x1  
     * @param y1
     * @param x2
     * @param y2
     */
    //% blockId=grove_oled_draw_rec 
    //% block="Draw a rectangle start at x %x1 and y %y1| , end at x %x2| and y %y2|"
    //% y1.min=0 y1.max=128
    //% x1.min=0 x1.max=64
    //% y2.min=0 y2.max=128
    //% x2.min=0 x2.max=64
    export function drawRec(x1: number, y1: number, x2: number, y2: number) {
        let temp = 0;
        if (y2 < y1) {
            temp = y2;
            y2 = y1;
            y1 = temp;
        }
        if (x2 < x1) {
            temp = x2;
            x2 = x1;
            x1 = temp;
        }

        drawHLine(x1, y1, y2 - y1 + 1);
        drawHLine(x2, y1, y2 - y1 + 1);
        drawVLine(x1, y1, x2 - x1 + 1);
        drawVLine(x1, y2, x2 - x1 + 1);
    }


    /**
     * Draw a rectangle 2.335
     * @param x0
     * @param y0
     * @param r
     */
    //% blockId=grove_oled_draw_cir
    //% block="Draw a circle start at x %x0 and y %y0| , radius r %r|"
    //% y0.min=0 y0.max=128
    //% x0.min=0 x0.max=64
    //% r.min=0 r.max=64
    export function drawCircle(x0: number, y0: number, r: number) {
        let color = 11;
        let f = 1 - r;
        let ddF_x = 1;
        let ddF_y = -2 * r;
        let x = 0;
        let y = r;

        drawPixel(x0, y0 + r, color);
        drawPixel(x0, y0 - r, color);
        drawPixel(x0 + r, y0, color);
        drawPixel(x0 - r, y0, color);

        while (x < y) {
            if (f >= 0) {
                y--;
                ddF_y += 2;
                f += ddF_y;
            }
            x++;
            ddF_x += 2;
            f += ddF_x;



            drawPixel(x0 + x, y0 + y, color);
            drawPixel(x0 - x, y0 + y, color);
            drawPixel(x0 + x, y0 - y, color);
            drawPixel(x0 - x, y0 - y, color);
            drawPixel(x0 + y, y0 + x, color);
            drawPixel(x0 - y, y0 + x, color);
            drawPixel(x0 + y, y0 - x, color);
            drawPixel(x0 - y, y0 - x, color);
        }
    }








    /**
     * Draw a character 2.777 ----------------------------------
     * @param c
     * @param x
     * @param y
     * @param size
     */
    //% blockId=grove_oled_draw_char
    //% block="Draw a character %c start at x %x| and y %y| , size  %size|"
    //% y.min=0 y.max=128
    //% x.min=0 x.max=64
    //% size.min=1 size.max=4 
    export function drawChar(x: number, y: number, c: number, size: number) {
        if (
            (x >= 128) || // Clip right
            (y >= 64) || // Clip bottom
            ((x + 8 * size - 1) < 0) || // Clip left
            ((y + 8 * size - 1) < 0) // Clip top
        )
            return;

        for (let i = 0; i < 6; i++) {
            let line = 0;

            if (i == 8)
                line = 0x0;
            else
                line = basicFont[(c % 4 * 8) + i];;//basicFont_english[(c * 8) + i];//hak temp

            for (let j = 0; j < 8; j++) {
                if (line & 0x1) {
                    if (size == 1) // default size
                        drawPixel(x + i, y + j, 0x01);
                    else // big size
                        drawRec(x + (i * size), y + (j * size), size, size);
                }
                line >>= 1;
            }
        }
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

const basicFont: number[] = [
    0x00, 0x3F, 0x40, 0x38, 0x40, 0x3F, 0x00, 0x00, //   "W"
    0x00, 0x63, 0x14, 0x08, 0x14, 0x63, 0x00, 0x00, //   "X"
    0x00, 0x03, 0x04, 0x78, 0x04, 0x03, 0x00, 0x00, //   "Y"
    0x00, 0x61, 0x51, 0x49, 0x45, 0x43, 0x00, 0x00 //    "Z"
]
const basicFont_arabic_starting: string[] = [
    "\x00\x00\x00\x00\x00\x00\x00\x00", // " "  0
    "\x00\x00\x20\x30\x28\x00\x00\x00", // "!"  1   ء
    "\x03\x01\x02\x03\x00\x3F\x00\x00", // """  2   آ
    "\x00\x04\x06\x05\x00\x3F\x00\x00", // "#"  3   أ
    "\x04\x07\x45\x40\x44\x2A\x1E\x00", // "$"  4   ؤ
    "\x10\x24\x26\x25\x20\x1F\x00\x00", // "%"  5   إ
    "\x34\x67\x45\x40\x4C\x2A\x12\x00", // "&"  6   ئ
    "\x00\x00\x00\x00\x00\x3F\x00\x00", // "'"  7   ا
    "\x10\x10\x10\x10\x50\x10\x10\x1C", // "("  8   baa
    "\x00\x00\x1D\x24\x25\x18\x00\x00", // ")"  9   ة
    "\x38\x20\x20\x22\x20\x22\x20\x38", // "*"  10  ت
    "\x10\x10\x14\x12\x14\x10\x10\x1C", // "+"  11  thaa
    "\x00\x70\x8A\xAA\x8A\x44\x00\x00", // ","  12  ج
    "\x00\x70\x8A\x8A\x8A\x44\x00\x00", // "-"  13  ح
    "\x00\x70\x8A\x8A\x8A\x44\x01\x00", // "."  14  خ
    "\x00\x00\x20\x24\x28\x10\x00\x00", // "/"  15  د
    "\x00\x00\x20\x24\x28\x12\x00\x00", // "0"  16  ذ
    "\x00\x40\x40\x40\x20\x18\x00\x00", // "1"  17  ر
    "\x00\x40\x40\x40\x20\x1A\x00\x00", // "2"  18  ز
    "\x10\x10\x1C\x10\x1C\x10\x1C\x00", // "3"  19  seen
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
    "\x00\x38\x44\x44\x48\x7F\x00\x00" // "d"

];


const basicFont_arabic_separate: string[] = [
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
    "\x00\x38\x44\x44\x48\x7F\x00\x00" // "d"

];


const basicFont_arabic_ending: string[] = [
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
    "\x1C\x10\x12\x10\x12\x10\x1C\x10", // "*"  10  taa
    "\x18\x20\x20\x22\x21\x22\x20\x18", // "+"  11  ث
    "\x00\x70\x8A\xAA\x8A\x44\x00\x00", // ","  12  ج
    "\x00\x70\x8A\x8A\x8A\x44\x00\x00", // "-"  13  ح
    "\x00\x70\x8A\x8A\x8A\x44\x01\x00", // "."  14  خ
    "\x00\x00\x20\x24\x28\x10\x00\x00", // "/"  15  د
    "\x00\x00\x20\x24\x28\x12\x00\x00", // "0"  16  ذ
    "\x80\x80\x40\x38\x10\x10\x10\x10", // "1"  17  raa
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
    "\x00\x38\x44\x44\x48\x7F\x00\x00" // "d"

];

const basicFont_arabic_mid: string[] = [
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
    "\x10\x10\x14\x14\x14\x18\x10\x10", // "-"  13  hhaa
    "\x00\x70\x8A\x8A\x8A\x44\x01\x00", // "."  14  خ
    "\x00\x00\x20\x24\x28\x10\x00\x00", // "/"  15  د
    "\x00\x00\x20\x24\x28\x12\x00\x00", // "0"  16  ذ
    "\x00\x40\x40\x40\x20\x18\x00\x00", // "1"  17  ر
    "\x00\x40\x40\x40\x20\x1A\x00\x00", // "2"  18  ز
    "\x10\x10\x1C\x10\x1C\x10\x1C\x10", // "3"  19  seen
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
    "\x10\x10\x10\x7C\xD6\x7C\x10\x10", // "G"  39  haa
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
    "\x00\x38\x44\x44\x48\x7F\x00\x00" // "d"

];

const basicFont_english: string[] = [
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
    "\x00\x38\x44\x44\x48\x7F\x00\x00" // "d"

];

