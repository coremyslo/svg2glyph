import type { Case } from "./types";
import { Readable } from "node:stream";
import { promises as fsp } from "fs";
import path from "path";
import { optimize as svgoOptimize } from "svgo";
import toCase from "case";
import isSVG from "is-svg";

export interface IconOptions {
    nameCase: Case;
    sourceDirPath: string;
}

export class Icon {
    public nameCase: Case = "kebab";

    public sourceDirPath = "";

    public name: string;

    public sourceFilePath = "";

    public content = "";

    public constructor (sourceFilePath: string, options: Partial<IconOptions> = {}) {
        if (path.parse(sourceFilePath).ext !== ".svg") {
            throw new Error(`${sourceFilePath} is not correct svg file path`);
        }
        this.sourceFilePath = sourceFilePath;
        if (options.nameCase) {
            this.nameCase = options.nameCase;
        }
        if (options.sourceDirPath) {
            this.sourceDirPath = options.sourceDirPath;
        }
        if (this.sourceDirPath) {
            this.name = toCase[this.nameCase](sourceFilePath.substring(sourceFilePath.indexOf(this.sourceDirPath) + this.sourceDirPath.length).slice(0, -4).replace(/\//g, "-"));
        } else {
            this.name = toCase[this.nameCase](path.parse(sourceFilePath).name);
        }
    }

    public optimize (): this {
        if (this.content) {
            throw new Error("content is not set yet");
        }
        this.content = svgoOptimize(this.content).data;

        return this;
    }

    public async read (): Promise<this> {
        const content = await fsp.readFile(this.sourceFilePath, "utf8");
        if (!isSVG(content)) {
            throw new Error(`${this.sourceFilePath} file content is not valid svg`);
        }
        this.content = content;

        return this;
    }

    public getGlyph (options: object): Readable {
        return Object.assign(Readable.from([this.content]), options);
    }
}