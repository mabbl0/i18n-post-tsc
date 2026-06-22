import fs from 'fs'

/**
 * Fast read of a file
 * @param filename file name
 * @param endCallback callback after error or at the end of the read
 * @param param parameter return in the end callback
 */
export function fastRead<ParamT>(filename: string, endCallback: (err: Error|null, data?: Buffer, param?: ParamT) => void, param?: ParamT) {
	fs.open(filename, "r", 0o666, (err, fd) => {
		if (err) {
            return endCallback(err, undefined, param);
        }
		
        fs.fstat(fd, (err, stats) => {
			if (err) {
                fs.close(fd, () => endCallback(err, undefined, param));
                return;
            }
		
            const data = Buffer.allocUnsafe(stats.size);
			fs.read(fd, data, 0, stats.size, 0, (err, bytesRead) => {
				if (err) {
                    fs.close(fd, () => endCallback(err, undefined, param));
                    return;
                }
                if (bytesRead !== stats.size) {
					const err = new Error("Read fewer bytes than requested");
                    fs.close(fd, () => endCallback(err, undefined, param));
                    return;
				}
                // successfully read
                fs.close(fd, err => endCallback(err, data, param));
			});
		});
	});
}

/**
 * Fast read and write a file
 * @param filename file name
 * @param getDataToWrite sync function to procees readed file data and return the new data to write
 * @param endCallback and callback after error or after write callback
 * @param param parameter return in the end callback
 */
export function fastReadWrite<ParamT>(filename: string, getDataToWrite: (dataReaded: string, param?: ParamT) => string, endCallback: (err: Error|null, param?: ParamT) => void, param?: ParamT) {
	fs.open(filename, "r+", 0o666, (err, fd) => {
		if (err) {
            return endCallback(err, param);
        }
		
        fs.fstat(fd, (err, stats) => {
			if (err) {
                fs.close(fd, () => endCallback(err, param));
                return;
            }
		
            const data = Buffer.allocUnsafe(stats.size);
			fs.read(fd, data, 0, stats.size, 0, (err, bytesRead) => {
				if (err) {
                    fs.close(fd, () => endCallback(err, param));
                    return;
                }
                if (bytesRead !== stats.size) {
					const err = new Error("Read fewer bytes than requested");
                    fs.close(fd, () => endCallback(err, param));
                    return;
				}
                // successfully read

                fs.write(fd, getDataToWrite(data.toString(), param), () => 
                    fs.close(fd, err => endCallback(err, param))
                );
			});
		});
	});

}