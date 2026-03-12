const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let startParts = startTime.split(' ');
    let startTimeStr = startParts[0]; 
    let startPeriod = startParts[1];   

    let startHMS = startTimeStr.split(':'); 
    let startHour = parseInt(startHMS[0]);   
    let startMinute = parseInt(startHMS[1]); 
    let startSecond = parseInt(startHMS[2]);    
    
    let endParts = endTime.split(' ');
    let endTimeStr = endParts[0]; 
    let endPeriod = endParts[1];   
    
    let endHMS = endTimeStr.split(':');
    let endHour = parseInt(endHMS[0]);       
    let endMinute = parseInt(endHMS[1]);      
    let endSecond = parseInt(endHMS[2]);      

    if (startPeriod === "am" && startHour === 12) {
        startHour = 0;  
    } else if (startPeriod === "pm" && startHour !== 12) {
        startHour = startHour + 12;  
    }

    if (endPeriod === "am" && endHour === 12) {
        endHour = 0;
    } else if (endPeriod === "pm" && endHour !== 12) {
        endHour = endHour + 12; 
    }

    let startTotalSeconds = (startHour * 3600) + (startMinute * 60) + startSecond;
    let endTotalSeconds = (endHour * 3600) + (endMinute * 60) + endSecond;

    let diffSeconds = endTotalSeconds - startTotalSeconds;

    if (diffSeconds < 0) {
        diffSeconds = diffSeconds + (24 * 3600); 
    }
    
    let hours = Math.floor(diffSeconds / 3600);
    
    let remainingSeconds = diffSeconds % 3600;
    
    let minutes = Math.floor(remainingSeconds / 60);
    
    let seconds = remainingSeconds % 60;

    let minutesStr;
    if (minutes < 10) {
        minutesStr = "0" + minutes;  
    } else {
        minutesStr = minutes.toString();  
    }
    
    let secondsStr;
    if (seconds < 10) {
        secondsStr = "0" + seconds;  
    } else {
        secondsStr = seconds.toString();  
    }
    
    let hoursStr = hours.toString();
    
     return hoursStr + ":" + minutesStr + ":" + secondsStr;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    function timeToSeconds(timeStr) {
        let parts = timeStr.split(' ');
        let time = parts[0];  
        let period = parts[1]; 
        
        let hms = time.split(':');
        let hour = parseInt(hms[0]);
        let minute = parseInt(hms[1]);
        let second = parseInt(hms[2]);
        
        if (period === "am" && hour === 12) {
            hour = 0;
        } else if (period === "pm" && hour !== 12) {
            hour = hour + 12;
        }
        
        return (hour * 3600) + (minute * 60) + second;
    }
    

    let startSeconds = timeToSeconds(startTime);
    let endSeconds = timeToSeconds(endTime);
    

    let deliveryStartSeconds = 8 * 3600; 
    let deliveryEndSeconds = 22 * 3600;     
    
    if (endSeconds < startSeconds) {
        endSeconds += 24 * 3600; 
    }

    let idleSeconds = 0;
    let currentTime = startSeconds;
    
    while (currentTime < endSeconds) {
        let timeOfDay = currentTime % (24 * 3600);
        
        if (timeOfDay < deliveryStartSeconds || timeOfDay >= deliveryEndSeconds) {
            idleSeconds++;
        }
        
        currentTime++;
    }

    let hours = Math.floor(idleSeconds / 3600);
    let remainingSeconds = idleSeconds % 3600;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;
    
    function formatTwoDigits(num) {
        if (num < 10) {
            return "0" + num;
        } else {
            return "" + num;
        }
    }
    
    return hours + ":" + formatTwoDigits(minutes) + ":" + formatTwoDigits(seconds);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    function timeToSeconds(timeStr) {

        let parts = timeStr.split(':');
        
        let hours = parseInt(parts[0]);    
        let minutes = parseInt(parts[1]);    
        let seconds = parseInt(parts[2]);    
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    

    function secondsToTime(totalSeconds) {
        let hours = Math.floor(totalSeconds / 3600);
        let remainingSeconds = totalSeconds % 3600;
        let minutes = Math.floor(remainingSeconds / 60);
        let seconds = remainingSeconds % 60;
        
        let minutesStr;
        if (minutes < 10) {
            minutesStr = "0" + minutes;
        } else {
            minutesStr = "" + minutes;
        }
        
        let secondsStr;
        if (seconds < 10) {
            secondsStr = "0" + seconds;
        } else {
            secondsStr = "" + seconds;
        }
        
        return hours + ":" + minutesStr + ":" + secondsStr;
    }
    

    let shiftSeconds = timeToSeconds(shiftDuration);
    let idleSeconds = timeToSeconds(idleTime);
    

    let activeSeconds = shiftSeconds - idleSeconds;
    
    if (activeSeconds < 0) {
        activeSeconds = 0;
    }

    return secondsToTime(activeSeconds);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    function timeToMinutes(timeStr) {
        let parts = timeStr.split(':');
        let hours = parseInt(parts[0]);
        let minutes = parseInt(parts[1]);
        
        return (hours * 60) + minutes;
    }
    
    let dateParts = date.split('-');
    let year = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]);
    let day = parseInt(dateParts[2]);
    
    let isEidPeriod = false;
    if (year === 2025 && month === 4) { 
        if (day >= 10 && day <= 30) {
            isEidPeriod = true;
        }
    }
    
    let requiredMinutes;
    if (isEidPeriod) {
        requiredMinutes = 6 * 60;
    } else {
        requiredMinutes = (8 * 60) + 24; 
    }
    
    let activeMinutes = timeToMinutes(activeTime);
    
    return activeMinutes >= requiredMinutes;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let fileContent = '';
    try {
        fileContent = fs.readFileSync(textFile, 'utf8');
    } catch (err) {
        fileContent = '';
    }

    let lines = fileContent.split('\n');
    let records = [];


    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') continue;
        if (i === 0 && line.startsWith('DriverID')) continue;
        let parts = line.split(',');
        if (parts.length >= 10) {
            let record = {
                driverID: parts[0].trim(),
                driverName: parts[1].trim(),
                date: parts[2].trim(),
                startTime: parts[3].trim(),
                endTime: parts[4].trim(),
                shiftDuration: parts[5].trim(),
                idleTime: parts[6].trim(),
                activeTime: parts[7].trim(),
                metQuota: parts[8].trim() === 'true',
                hasBonus: parts[9].trim() === 'true'
            };
            records.push(record);
        }
    }

    for (let i = 0; i < records.length; i++) {
        if (records[i].driverID === shiftObj.driverID && records[i].date === shiftObj.date) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let metQuotaValue = metQuota(shiftObj.date, activeTime);
    let hasBonus = false;

    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: metQuotaValue,
        hasBonus: hasBonus
    };

    let insertIndex = records.length; 
    for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].driverID === shiftObj.driverID) {
            insertIndex = i + 1;
            break;
        }
    }

    records.splice(insertIndex, 0, newRecord);

    let outputLines = [];
    let originalLines = fileContent.split('\n');
    let hadHeader = false;
    if (originalLines.length > 0 && originalLines[0].trim().startsWith('DriverID')) {
        hadHeader = true;
        outputLines.push(originalLines[0].trim()); 
    }

    for (let i = 0; i < records.length; i++) {
        let r = records[i];
        let line = r.driverID + ',' + r.driverName + ',' + r.date + ',' + r.startTime + ',' +
                   r.endTime + ',' + r.shiftDuration + ',' + r.idleTime + ',' + r.activeTime + ',' +
                   (r.metQuota ? 'true' : 'false') + ',' + (r.hasBonus ? 'true' : 'false');
        outputLines.push(line);
    }

    fs.writeFileSync(textFile, outputLines.join('\n'), 'utf8');

    return newRecord;


}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
   let fileContent;
    try {
        fileContent = fs.readFileSync(textFile, 'utf8');
    } catch (err) {
        return;
    }

    let lines = fileContent.split(/\r?\n/);
    let updated = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() === '') continue;

        let firstField = line.split(',')[0].trim();
        if (i === 0 && firstField === 'DriverID') {
            continue; 
        }

        let parts = line.split(',');
        if (parts.length < 10) continue; 

        let id = parts[0].trim();
        let d = parts[2].trim();

        if (id === driverID && d === date) {
            parts[9] = newValue ? 'true' : 'false';
            lines[i] = parts.join(',');
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(textFile, lines.join('\n'), 'utf8');
    }
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    let monthNum = parseInt(month, 10);
    let monthStr = monthNum < 10 ? '0' + monthNum : monthNum.toString();

    let fileContent;
    try {
        fileContent = fs.readFileSync(textFile, 'utf8');
    } catch (err) {
        return -1;
    }

    let lines = fileContent.split('\n');
    let driverExists = false;
    let bonusCount = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') continue;

        if (i === 0 && line.startsWith('DriverID')) continue;

        let parts = line.split(',');
        if (parts.length < 10) continue; 

        let id = parts[0].trim();
        let dateStr = parts[2].trim();          
        let hasBonus = parts[9].trim() === 'true';

        if (id === driverID) {
            driverExists = true;
            let dateParts = dateStr.split('-');
            if (dateParts.length >= 2) {
                let recordMonth = dateParts[1]; 
                if (recordMonth === monthStr && hasBonus) {
                    bonusCount++;
                }
            }
        }
    }

    if (!driverExists) {
        return -1;
    }
    return bonusCount;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    function activeTimeToSeconds(activeStr) {
        let parts = activeStr.split(':');
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        let seconds = parseInt(parts[2], 10);
        return hours * 3600 + minutes * 60 + seconds;
    }

    let monthNum = month;
    let monthStr = monthNum < 10 ? '0' + monthNum : monthNum.toString();

    let fileContent;
    try {
        fileContent = fs.readFileSync(textFile, 'utf8');
    } catch (err) {
        return "0:00:00";
    }

    let lines = fileContent.split('\n');
    let totalSeconds = 0;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') continue;

        if (i === 0 && line.startsWith('DriverID')) continue;

        let parts = line.split(',');
        if (parts.length < 8) continue; 

        let id = parts[0].trim();
        let dateStr = parts[2].trim(); 
        let activeStr = parts[7].trim();

        if (id === driverID) {
        
            let dateParts = dateStr.split('-');
            if (dateParts.length >= 2) {
                let recordMonth = dateParts[1];
                if (recordMonth === monthStr) {
                    totalSeconds += activeTimeToSeconds(activeStr);
                }
            }
        }
    }

    let hours = Math.floor(totalSeconds / 3600);
    let remaining = totalSeconds % 3600;
    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;

    let minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    let secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
    let hoursStr = hours.toString();

    return hoursStr + ':' + minutesStr + ':' + secondsStr;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    function timeToSeconds(timeStr) {
        let parts = timeStr.split(':');
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        let seconds = parseInt(parts[2], 10);
        return hours * 3600 + minutes * 60 + seconds;
    }

    function secondsToTime(totalSeconds) {
        if (totalSeconds < 0) totalSeconds = 0;
        let hours = Math.floor(totalSeconds / 3600);
        let remaining = totalSeconds % 3600;
        let minutes = Math.floor(remaining / 60);
        let seconds = remaining % 60;
        let minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
        let secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
        return hours + ':' + minutesStr + ':' + secondsStr;
    }

    let rateContent;
    try {
        rateContent = fs.readFileSync(rateFile, 'utf8');
    } catch (err) {
        return "0:00:00";
    }
    let rateLines = rateContent.split('\n');
    let dayOff = null;
    for (let i = 0; i < rateLines.length; i++) {
        let line = rateLines[i].trim();
        if (line === '') continue;
        if (i === 0 && line.startsWith('DriverID')) continue;
        let parts = line.split(',');
        if (parts.length >= 2) {
            let id = parts[0].trim();
            if (id === driverID) {
                dayOff = parts[1].trim(); 
                break;
            }
        }
    }
    if (dayOff === null) {
        return "0:00:00"; 
    }

    
    let dayOffMap = {
        "sunday": 0,
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6
    };
    let dayOffNum = dayOffMap[dayOff.toLowerCase()];
    if (dayOffNum === undefined) {
        return "0:00:00"; 
    }

    let shiftContent;
    try {
        shiftContent = fs.readFileSync(textFile, 'utf8');
    } catch (err) {
        return "0:00:00";
    }
    let shiftLines = shiftContent.split('\n');
    let monthStr = month < 10 ? '0' + month : month.toString();
    let totalRequiredSeconds = 0;

    for (let i = 0; i < shiftLines.length; i++) {
        let line = shiftLines[i].trim();
        if (line === '') continue;
        if (i === 0 && line.startsWith('DriverID')) continue;
        let parts = line.split(',');
        if (parts.length < 3) continue; 
        let id = parts[0].trim();
        let dateStr = parts[2].trim();
        if (id !== driverID) continue;

        let dateParts = dateStr.split('-');
        if (dateParts.length < 2) continue;
        let recordMonth = dateParts[1]; 
        if (recordMonth !== monthStr) continue;

        let year = parseInt(dateParts[0], 10);
        let monthIdx = parseInt(dateParts[1], 10) - 1; 
        let day = parseInt(dateParts[2], 10);
        let dateObj = new Date(year, monthIdx, day);
        let dayOfWeek = dateObj.getDay(); 

        if (dayOfWeek === dayOffNum) {
            continue;
        }

        let quotaSeconds;
        if (year === 2025 && monthIdx === 3) { 
            if (day >= 10 && day <= 30) {
                quotaSeconds = 6 * 3600; 
            } else {
                quotaSeconds = 8 * 3600 + 24 * 60; 
            }
        } else {
            quotaSeconds = 8 * 3600 + 24 * 60;
        }

        totalRequiredSeconds += quotaSeconds;
    }

    let bonusDeductionSeconds = bonusCount * 2 * 3600;
    totalRequiredSeconds -= bonusDeductionSeconds;

    return secondsToTime(totalRequiredSeconds);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    function timeToSeconds(timeStr) {
        let parts = timeStr.split(':');
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        let seconds = parseInt(parts[2], 10);
        return hours * 3600 + minutes * 60 + seconds;
    }

    let rateContent;
    try {
        rateContent = fs.readFileSync(rateFile, 'utf8');
    } catch (err) {
        return 0; 
    }
    let rateLines = rateContent.split('\n');
    let basePay = null;
    let tier = null;

    for (let i = 0; i < rateLines.length; i++) {
        let line = rateLines[i].trim();
        if (line === '') continue;
        if (i === 0 && line.startsWith('DriverID')) continue;
        let parts = line.split(',');
        if (parts.length >= 4) {
            let id = parts[0].trim();
            if (id === driverID) {
                basePay = parseInt(parts[2].trim(), 10); 
                tier = parseInt(parts[3].trim(), 10);   
                break;
            }
        }
    }
    if (basePay === null || tier === null) {
        return 0; 
    }

    let allowedMissingHours;
    if (tier === 1) allowedMissingHours = 50;
    else if (tier === 2) allowedMissingHours = 20;
    else if (tier === 3) allowedMissingHours = 10;
    else if (tier === 4) allowedMissingHours = 3;
    else allowedMissingHours = 0; 

    let actualSec = timeToSeconds(actualHours);
    let requiredSec = timeToSeconds(requiredHours);

    if (actualSec >= requiredSec) {
        return basePay;
    }

    let missingSeconds = requiredSec - actualSec;
    let missingFullHours = Math.floor(missingSeconds / 3600); 

    let billableMissing = missingFullHours - allowedMissingHours;
    if (billableMissing < 0) billableMissing = 0;

    let deductionPerHour = Math.floor(basePay / 185);
    let deduction = billableMissing * deductionPerHour;
    let netPay = basePay - deduction;
    if (netPay < 0) netPay = 0;

    return netPay;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
