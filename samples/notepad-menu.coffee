parse = require "../lib/indent-parse"

module.exports = parse """
  [F]ile
    [N]ew
    [O]pen
    [S]ave
    Save [A]s
    -
    Page Set[u]p
    [P]rint
    -
    E[x]it
  [E]dit
    [U]ndo
    Redo
    -
    Cu[t]
    [C]opy
    [P]aste
    De[l]ete
    -
    [F]ind
    Find [N]ext
    [R]eplace
    [G]o To
    -
    Select [A]ll
    Time/[D]ate
  F[o]rmat
    [W]ord Wrap
    [F]ont...
  [V]iew
    [S]tatus Bar
  [H]elp
    View [H]elp
    -
    [A]bout Notepad
"""
