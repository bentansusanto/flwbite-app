export class EscPosEncoder {
  private buffer: number[] = [];
  
  // 32 chars for 58mm printer usually, 48 chars for 80mm
  public maxChars = 32;

  constructor(is80mm: boolean = false) {
    this.maxChars = is80mm ? 48 : 32;
  }

  public init() {
    this.buffer.push(0x1b, 0x40); // ESC @
    return this;
  }

  public alignLeft() {
    this.buffer.push(0x1b, 0x61, 0x00);
    return this;
  }

  public alignCenter() {
    this.buffer.push(0x1b, 0x61, 0x01);
    return this;
  }

  public alignRight() {
    this.buffer.push(0x1b, 0x61, 0x02);
    return this;
  }
  
  public boldOn() {
    this.buffer.push(0x1b, 0x45, 0x01);
    return this;
  }
  
  public boldOff() {
    this.buffer.push(0x1b, 0x45, 0x00);
    return this;
  }

  public newline() {
    this.buffer.push(0x0a);
    return this;
  }

  public text(str: string) {
    for (let i = 0; i < str.length; i++) {
      // Basic ASCII / UTF-8 fallback to avoid complex encoding issues
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  public textLine(str: string) {
    this.text(str);
    this.newline();
    return this;
  }

  public dashedLine() {
    this.text("-".repeat(this.maxChars));
    this.newline();
    return this;
  }

  // Prints a row with left-aligned and right-aligned text (e.g. "Total     1000")
  public row(leftText: string, rightText: string) {
    const spaceLength = this.maxChars - leftText.length - rightText.length;
    let str = "";
    if (spaceLength > 0) {
      str = leftText + " ".repeat(spaceLength) + rightText;
    } else {
      // Truncate left side if it doesn't fit
      str = leftText.substring(0, this.maxChars - rightText.length - 1) + " " + rightText;
    }
    this.textLine(str);
    return this;
  }

  public cut() {
    // GS V A 0 - Partial/Full cut command depending on printer hardware
    this.buffer.push(0x1d, 0x56, 0x41, 0x00); 
    return this;
  }

  public encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
