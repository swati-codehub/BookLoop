const conditionRank = {
    FAIR: 1,
    GOOD: 2,
    LIKE_NEW: 3,
    NEW: 4
};

const calculateMatchScore = (request, book) => {
    let score = 0;

    // 1. Book / Subject Match — 35
    if (
        request.title &&
        book.title &&
        request.title.toLowerCase() === book.title.toLowerCase()
    ) {
        score += 35;
    } else if (
        request.subject &&
        book.subject &&
        request.subject.toLowerCase() === book.subject.toLowerCase()
    ) {
        score += 25;
    }

    // 2. Budget / Price — 20
    if (request.preference === "FREE" && book.listingType === "DONATE") {
        score += 20;
    } else if (
        request.maxBudget !== undefined &&
        book.price <= request.maxBudget
    ) {
        score += 20;
    } else if (
        request.maxBudget !== undefined &&
        book.price <= request.maxBudget + 100
    ) {
        score += 5;
    }

    // 3. Condition — 15
    if (request.preferredCondition && book.condition) {
        const requested = conditionRank[request.preferredCondition];
        const actual = conditionRank[book.condition];

        if (requested === actual) {
            score += 15;
        } else if (actual > requested) {
            score += 13;
        } else if (actual === requested - 1) {
            score += 8;
        } else {
            score += 3;
        }
    } else {
        score += 10;
    }

    // 4. Edition — 10
    if (request.preferredEdition && book.edition) {
        if (
            request.preferredEdition.toLowerCase() ===
            book.edition.toLowerCase()
        ) {
            score += 10;
        } else {
            score += 3;
        }
    } else {
        score += 5;
    }

    // 5. Location — 10
    if (
        request.location?.city &&
        book.location?.city &&
        request.location.city.toLowerCase() ===
        book.location.city.toLowerCase()
    ) {
        if (
            request.location.area &&
            book.location.area &&
            request.location.area.toLowerCase() ===
            book.location.area.toLowerCase()
        ) {
            score += 10;
        } else {
            score += 7;
        }
    } else if (request.location?.city && book.location?.city) {
        score += 2;
    }

    // 6. Preference / Listing Type — 10
    if (
        request.preference === "BUY" &&
        book.listingType === "SELL"
    ) {
        score += 10;
    } else if (
        request.preference === "EXCHANGE" &&
        book.listingType === "EXCHANGE"
    ) {
        score += 10;
    } else if (
        request.preference === "FREE" &&
        book.listingType === "DONATE"
    ) {
        score += 10;
    }

    return score;
};

module.exports = calculateMatchScore;