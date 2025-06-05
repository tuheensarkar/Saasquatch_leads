export function validateEmail(email: string): { isValid: boolean; reason?: string; score: number } {
  if (!email) return { isValid: false, reason: "Empty email", score: 0 }

  // Basic format validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: "Invalid email format", score: 0 }
  }

  let score = 50 // Base score for valid format

  // Check for common typos in domains
  const commonDomainTypos = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahooo.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlok.com": "outlook.com",
  }

  const domain = email.split("@")[1]?.toLowerCase()
  if (commonDomainTypos[domain]) {
    return { isValid: false, reason: `Did you mean ${commonDomainTypos[domain]}?`, score: 20 }
  }

  // Check for disposable/temporary email domains
  const disposableDomains = [
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "throwaway.email",
    "temp-mail.org",
    "yopmail.com",
    "maildrop.cc",
    "sharklasers.com",
    "grr.la",
    "guerrillamailblock.com",
    "pokemail.net",
    "spam4.me",
    "bccto.me",
    "chacuo.net",
    "dispostable.com",
  ]

  if (disposableDomains.includes(domain)) {
    return { isValid: false, reason: "Disposable email domain detected", score: 10 }
  }

  // Check for business domains (higher score)
  const businessDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "aol.com",
    "icloud.com",
    "protonmail.com",
    "zoho.com",
  ]

  if (!businessDomains.includes(domain)) {
    score += 30 // Likely business domain
  }

  // Check for role-based emails (lower score for sales purposes)
  const roleBasedPrefixes = ["info", "admin", "support", "sales", "marketing", "noreply", "no-reply"]
  const localPart = email.split("@")[0]?.toLowerCase()

  if (roleBasedPrefixes.some((prefix) => localPart.includes(prefix))) {
    score -= 20
    return { isValid: true, reason: "Role-based email (lower conversion potential)", score: Math.max(score, 30) }
  }

  // Check for plus addressing (gmail+tag@domain.com)
  if (localPart.includes("+")) {
    score += 10 // Shows technical awareness
  }

  // Domain validation - check for valid TLD
  const tldRegex = /\.[a-zA-Z]{2,}$/
  if (!tldRegex.test(domain)) {
    return { isValid: false, reason: "Invalid top-level domain", score: 10 }
  }

  // Length validation
  if (email.length > 254) {
    return { isValid: false, reason: "Email too long", score: 0 }
  }

  if (localPart.length > 64) {
    return { isValid: false, reason: "Local part too long", score: 10 }
  }

  return { isValid: true, score: Math.min(score, 100) }
}

export function validatePhone(phone: string): { isValid: boolean; normalized: string; type?: string; score: number } {
  if (!phone) return { isValid: false, normalized: "", score: 0 }

  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, "")

  // Handle different phone number formats
  const digits = cleaned.replace(/^\+?1?/, "") // Remove country code

  // US/Canada phone number validation
  if (digits.length === 10) {
    const areaCode = digits.substring(0, 3)
    const exchange = digits.substring(3, 6)
    const number = digits.substring(6, 10)

    // Check for invalid area codes
    const invalidAreaCodes = ["000", "555", "911"]
    if (invalidAreaCodes.includes(areaCode)) {
      return { isValid: false, normalized: phone, score: 0 }
    }

    // Check for invalid exchange codes
    if (exchange.startsWith("0") || exchange.startsWith("1")) {
      return { isValid: false, normalized: phone, score: 20 }
    }

    // Format as +1 (XXX) XXX-XXXX
    const normalized = `+1 (${areaCode}) ${exchange}-${number}`

    // Determine phone type based on area code patterns
    const mobileAreaCodes = ["917", "646", "347", "929", "718"] // Example mobile-heavy area codes
    const type = mobileAreaCodes.includes(areaCode) ? "mobile" : "landline"

    return {
      isValid: true,
      normalized,
      type,
      score: type === "mobile" ? 90 : 70,
    }
  }

  // International phone number validation
  if (cleaned.startsWith("+") && cleaned.length >= 8 && cleaned.length <= 15) {
    return {
      isValid: true,
      normalized: cleaned,
      type: "international",
      score: 60,
    }
  }

  // Toll-free numbers
  if (
    digits.length === 10 &&
    ["800", "888", "877", "866", "855", "844", "833", "822"].includes(digits.substring(0, 3))
  ) {
    const formatted = `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
    return {
      isValid: true,
      normalized: formatted,
      type: "toll-free",
      score: 50,
    }
  }

  return { isValid: false, normalized: phone, score: 0 }
}

export function calculateLeadScore(lead: {
  emailValid: boolean
  phoneValid: boolean
  revenue?: number
  industry?: string
  emailScore?: number
  phoneScore?: number
}): number {
  let score = 0

  // Email scoring (40 points max)
  if (lead.emailValid) {
    score += Math.round((lead.emailScore || 70) * 0.4)
  }

  // Phone scoring (30 points max)
  if (lead.phoneValid) {
    score += Math.round((lead.phoneScore || 70) * 0.3)
  }

  // Revenue scoring (20 points max)
  if (lead.revenue) {
    if (lead.revenue >= 10000000)
      score += 20 // $10M+
    else if (lead.revenue >= 5000000)
      score += 18 // $5M-10M
    else if (lead.revenue >= 1000000)
      score += 15 // $1M-5M
    else if (lead.revenue >= 500000)
      score += 12 // $500K-1M
    else if (lead.revenue >= 100000)
      score += 8 // $100K-500K
    else if (lead.revenue >= 50000) score += 5 // $50K-100K
  }

  // Industry scoring (10 points max)
  const industryScores = {
    Technology: 10,
    Software: 10,
    SaaS: 10,
    Finance: 9,
    Healthcare: 9,
    Manufacturing: 8,
    "Professional Services": 8,
    "Real Estate": 7,
    Retail: 6,
    Education: 6,
    "Non-profit": 4,
    Government: 3,
  }

  if (lead.industry && industryScores[lead.industry]) {
    score += industryScores[lead.industry]
  } else if (lead.industry) {
    score += 5 // Default for unlisted industries
  }

  return Math.min(score, 100)
}

export function getLeadPriority(score: number): {
  level: "Critical" | "High" | "Medium" | "Low" | "Cold"
  color: string
  action: string
  timeline: string
} {
  if (score >= 90) {
    return {
      level: "Critical",
      color: "red",
      action: "Contact immediately",
      timeline: "Within 1 hour",
    }
  } else if (score >= 80) {
    return {
      level: "High",
      color: "orange",
      action: "Contact today",
      timeline: "Within 4 hours",
    }
  } else if (score >= 60) {
    return {
      level: "Medium",
      color: "yellow",
      action: "Contact this week",
      timeline: "Within 2 days",
    }
  } else if (score >= 40) {
    return {
      level: "Low",
      color: "blue",
      action: "Nurture campaign",
      timeline: "Within 1 week",
    }
  } else {
    return {
      level: "Cold",
      color: "gray",
      action: "Data enrichment needed",
      timeline: "Review monthly",
    }
  }
}

export function generateLeadInsights(leads: any[]): {
  dataQuality: number
  conversionPotential: number
  recommendations: string[]
  risks: string[]
} {
  const totalLeads = leads.length
  if (totalLeads === 0) {
    return {
      dataQuality: 0,
      conversionPotential: 0,
      recommendations: [],
      risks: [],
    }
  }

  // Calculate data quality score
  const validEmails = leads.filter((lead) => lead.emailValid).length
  const validPhones = leads.filter((lead) => lead.phoneValid).length
  const hasRevenue = leads.filter((lead) => lead.revenue > 0).length
  const hasIndustry = leads.filter((lead) => lead.industry).length

  const dataQuality = Math.round(((validEmails + validPhones + hasRevenue + hasIndustry) / (totalLeads * 4)) * 100)

  // Calculate conversion potential
  const highScoreLeads = leads.filter((lead) => lead.leadScore >= 80).length
  const conversionPotential = Math.round((highScoreLeads / totalLeads) * 100)

  // Generate recommendations
  const recommendations = []
  const risks = []

  if (validEmails / totalLeads < 0.7) {
    recommendations.push("Implement email verification service to improve deliverability")
    risks.push("High email bounce rate may damage sender reputation")
  }

  if (validPhones / totalLeads < 0.5) {
    recommendations.push("Add phone validation to increase contact options")
  }

  if (highScoreLeads / totalLeads > 0.3) {
    recommendations.push("Prioritize immediate outreach to high-scoring leads")
  }

  if (hasRevenue / totalLeads < 0.6) {
    recommendations.push("Enrich lead data with company revenue information")
    risks.push("Incomplete revenue data may lead to misallocated resources")
  }

  return {
    dataQuality,
    conversionPotential,
    recommendations,
    risks,
  }
}
