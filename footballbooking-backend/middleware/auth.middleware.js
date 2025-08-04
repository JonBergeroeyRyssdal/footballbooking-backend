import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Ingen token oppgitt' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'hemmelignøkkel', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Ugyldig token' })
    }
    req.user = user
    next()
  })
}

export const verifyOwner = (req, res, next) => {
  if (req.user?.role === 'owner') {
    next()
  } else {
    return res.status(403).json({ message: 'Kun baneeiere har tilgang' })
  }
}

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    next()
  } else {
    return res.status(403).json({ message: 'Kun administratorer har tilgang' })
  }
}


