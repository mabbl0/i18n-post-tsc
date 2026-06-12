import fs from 'fs'

/**
 * Fast read of a file
 * @param filename file name
 * @param endCallback callback after error or at the end of the read
 */
export function fastRead(filename: string, endCallback: (err: Error|null, data?: Buffer) => void) {
	fs.open(filename, "r", 0o666, (err, fd) => {
		if (err) {
            return endCallback(err);
        }
		
        fs.fstat(fd, (err, stats) => {
			if (err) {
                fs.close(fd, () => endCallback(err));
                return;
            }
		
            const data = Buffer.allocUnsafe(stats.size);
			fs.read(fd, data, 0, stats.size, 0, (err, bytesRead) => {
				if (err) {
                    fs.close(fd, () => endCallback(err));
                    return;
                }
                if (bytesRead !== stats.size) {
					const err = new Error("Read fewer bytes than requested");
                    fs.close(fd, () => endCallback(err));
                    return;
				}
                // successfully read
                fs.close(fd, err => endCallback(err, data));
			});
		});
	});
}

/**
 * Fast read and write a file
 * @param filename file name
 * @param getDataToWrite sync function to procees readed file data and return the new data to write
 * @param endCallback and callback after error or after write callback
 */
export function fastReadWrite(filename: string, getDataToWrite: (dataReaded: string) => string, endCallback: (err: Error|null) => void) {
	fs.open(filename, "r+", 0o666, (err, fd) => {
		if (err) {
            return endCallback(err);
        }
		
        fs.fstat(fd, (err, stats) => {
			if (err) {
                fs.close(fd, () => endCallback(err));
                return;
            }
		
            const data = Buffer.allocUnsafe(stats.size);
			fs.read(fd, data, 0, stats.size, 0, (err, bytesRead) => {
				if (err) {
                    fs.close(fd, () => endCallback(err));
                    return;
                }
                if (bytesRead !== stats.size) {
					const err = new Error("Read fewer bytes than requested");
                    fs.close(fd, () => endCallback(err));
                    return;
				}
                // successfully read

                fs.write(fd, getDataToWrite(data.toString()), () => 
                    fs.close(fd, err => endCallback(err))
                );
			});
		});
	});

}