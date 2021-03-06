from django.conf import settings

from residue.models import Residue
from structure.models import Structure
from structure.functions import BlastSearch

from Bio import SeqIO, pairwise2
from Bio.PDB import PDBParser, PPBuilder
import Bio.PDB.Polypeptide as polypeptide

import enum, os, xlsxwriter

#Number of heavy atoms in each residue
atom_count = {
    "ALA": 5,
    "ARG": 11, 
    "ASN": 8,
    "ASP": 8, 
    "CYS": 6,
    "GLN": 9,
    "GLU": 9, 
    "GLY": 4,
    "HIS": 10,
    "ILE": 8,
    "LEU": 8,
    "LYS": 9,
    "MET": 8,
    "PHE": 11,
    "PRO": 7,
    "SER": 6,
    "THR": 7,
    "TRP": 14,
    "TYR": 12,
    "VAL": 7,
    }

class ParsedResidue(object):

    def __init__(self, res_name, res_num, gpcrdb=None):
        
        self.resnum = None
        self.wt_num = res_num
        self.name = res_name
        self.mutation = None
        self.insertion = None
        self.deletion = False
        self.coords = ''
        self.gpcrdb = gpcrdb if gpcrdb else ''
        self.seqres = False
        self.fusion = None


    def __repr__(self, **kwargs):
        return "Residue {}{} PDB {} ({})\tMutated: {} Insertion: {} Fusion: {} SEQRES: {}".format(self.name, self.wt_num, self.resnum if self.resnum else '-', self.gpcrdb, self.mutation if self.mutation else '-', self.insertion if self.insertion else '', self.fusion, self.seqres)


    def get_param_list(self):
        return [self.wt_num, self.name, self.resnum if self.resnum else '-', self.gpcrdb, self.mutation if self.mutation else '-', 'X' if self.seqres else '']


    def set_mutation(self, mutation):
        self.mutation = mutation


    def set_insertion(self, insertion):
        self.insertion = insertion


    def set_fusion(self, fusion=True):
        self.fusion = fusion


    def set_seqres(self, seqres=True):
        self.seqres = seqres


    def set_coords_status(self, coords):
        self.coords = coords


    def set_gpcrdb(self, gpcrdb):
        self.gpcrdb = gpcrdb


    def set_wt_number(self, wt_num):
        self.wt_num = wt_num


    def set_pdb_res_num(self, res_num):
        self.resnum = res_num


class SequenceParser(object):
    """
    Class mapping the pdb, pdb_seqres, wildtype and any given sequence onto wt using blast with human sequences database. It produces a report with missing, mutated and inserted residues.
    """

    residue_list = ["ARG","ASP","GLU","HIS","ASN","GLN","LYS","SER","THR", "HIS", "HID","PHE","LEU","ILE","TYR","TRP","VAL","MET","PRO","CYS","ALA","GLY"]

    def __init__(self, pdb_file, sequence=None, wt_protein_id=None):

        # dictionary of 'ParsedResidue' object storing information about alignments and bw numbers
        self.mapping = {}
        self.residues = {}
        self.blast = BlastSearch(blastdb=os.sep.join([settings.STATICFILES_DIRS[0], 'blast', 'protwis_human_blastdb']))

        self.pdb_struct = PDBParser(QUIET=True).get_structure('pdb', pdb_file)[0]
        # a list of SeqRecord objects retrived from the pdb SEQRES section
        self.seqres = list(SeqIO.parse(pdb_file, 'pdb-seqres'))

        # SeqRecord id is a pdb_code:chain 
        self.struct_id = self.seqres[0].id.split(':')[0]
        # If not specified, attempt to get wildtype from pdb.
        if not wt_protein_id:
            self.wt = Structure.objects.get(pdb_code__index=self.struct_id).protein_conformation.protein.parent
        else:
            self.wt = Protein.objects.get(id=wt_protein_id)
        self.wt_seq = str(self.wt.sequence)
        self.fusions = []


        self.parse_pdb(self.pdb_struct)



    def parse_pdb(self, pdb_struct):
        """
        extracting sequence and preparing dictionary of residues
        bio.pdb reads pdb in the following cascade: model->chain->residue->atom
        """
        wt_resi = list(Residue.objects.filter(protein_conformation__protein=self.wt.id))
        for chain in pdb_struct:
            self.residues[chain.id] = []
            self.mapping[chain.id] = {x.sequence_number: ParsedResidue(x.amino_acid, x.sequence_number, str(x.display_generic_number) if x.display_generic_number else None) for x in wt_resi}
            
            for res in chain:
            #in bio.pdb the residue's id is a tuple of (hetatm flag, residue number, insertion code)
                if res.resname.replace('HID', 'HIS') not in self.residue_list:
                    continue
                self.residues[chain.id].append(res)
                #self.mapping[chain.id][res.id[1]] = ParsedResidue(polypeptide.three_to_one(res.resname.replace('HID', 'HIS')), res.id[1])


    def get_chain_peptides(self, chain_id, gap_threshold=230):
        """
        Get peptides of sequential residue numbers (with respect to 230 aa gaps).
        The maximum length of ICL3 is 230 aa, and fusion proteins usualy have significantly different numbers, i.e. exceeding the 230 gap between TM5 and 6.

        The maximum allowed gap size can be evaluated automaticaly, but it is fairly costly:
        max([len(Residue.objects.filter(protein_segment=11, protein_conformation__protein=x)) for x in Protein.objects.filter(species=1)])
        """

        rnumbers = [int(x.id[1]) for x in self.residues[chain_id]]
        last_idx = len(rnumbers)-1
        peptides = []
        tmp = []
        for i, rnum in enumerate(rnumbers):
            if i == last_idx:
                #FIXME: Assuming that very last residue is actualy continuation of a chain
                tmp.append(self.residues[chain_id][i])
                peptides.append(tmp)
                break
            if rnumbers[i+1] != rnum+1 and abs(rnum+1 - rnumbers[i+1]) > gap_threshold:
                tmp.append(self.residues[chain_id][i])
                peptides.append(tmp)
                tmp = []
            else:
                tmp.append(self.residues[chain_id][i])
        return peptides


    def get_chain_sequence(self, chain):
        return "".join([polypeptide.three_to_one(x.resname.replace('HID', 'HIS')) for x in chain if x.resname in self.residue_list])
    

    def map_to_wt_blast(self, chain_id, residues = None, sequence=None, starting_aa = 1, seqres = False):

        if residues:
            seq = self.get_chain_sequence(residues)
        elif sequence:
            seq = sequence
        else:
            return

        alignments = self.blast.run(seq)

        for alignment in alignments:
            if alignment[1].hsps[0].expect > 1. and residues:
                self.fusions.append(residues)
                #for res in residues:
                #    self.mapping[chain_id][res.id[1]].set_fusion()
            if self.wt.id != int(alignment[0]):
                continue
            for hsps in alignment[1].hsps:
                self.map_hsps(hsps, chain_id, starting_aa, seqres)
    

    def map_hsps(self, hsps, chain_id, offset = 1, seqres = False):
        """
        Analyzes the High Similarity Protein Segment.
        """
        q = hsps.query
        sbjct = hsps.sbjct
        sbjct_counter = hsps.sbjct_start	
        q_counter = hsps.query_start

        for s, q in zip(sbjct, q):
            if s == q:
                #r = Residue.objects.get(sequence_number=sbjct_counter, protein_conformation__protein=self.wt.id)
                #if r.display_generic_number is not None:
                #    self.mapping[chain_id][offset + q_counter].set_gpcrdb(r.display_generic_number)
                
                #self.mapping[chain_id][offset - 1 + q_counter].set_wt_number(sbjct_counter)
                if seqres:
                    self.mapping[chain_id][sbjct_counter].set_seqres(True)
                else:
                    self.mapping[chain_id][sbjct_counter].set_pdb_res_num(offset - 1 + q_counter)
                sbjct_counter += 1
                q_counter += 1
            elif s != '-' and q != '-':
                #print(s)
                #self.mapping[chain_id][offset - 1 + q_counter].set_mutation(s)
                #self.mapping[chain_id][offset - 1 + q_counter].set_wt_number(sbjct_counter)
                self.mapping[chain_id][sbjct_counter].set_pdb_res_num(offset - 1 + q_counter)
                self.mapping[chain_id][sbjct_counter].set_mutation(q)
                sbjct_counter += 1
                q_counter += 1
            elif s == '-' and q != '-':
                self.mapping[chain_id][offset - 1 + q_counter].set_insertion(q)
                q_counter += 1


    def map_to_wt_pw(self, chain_id, residues = None, sequence=None, starting_aa = 1):

        if residues:
            seq = self.get_chain_sequence(residues)
        elif sequence:
            seq = sequence
        else:
            return

        wt, chain_seq, score, start, end = pairwise2.align.localms(self.wt_seq, seq, 2, -4, -4, -.1, one_alignment_only=True)[0]

        offset = 0
        for w, c in zip(wt, chain_seq):
            if w == c:
                if seqres:
                    self.mapping[chain.id][starting_aa + offset].seqres=True
                r = Residue.objects.get(sequence_number=offset+self.wt_seq_start, protein_conformation__protein=self.wt.id)
                if r.display_generic_number is not None:
                    self.mapping[chain_id][starting_aa + offset].add_gpcrdb(r.display_generic_number)
                offset += 1
            elif c == '-' and w != '-':
                print(offset)
                self.mapping[chain_id][starting_aa + offset].add_deletion()
            elif w != '-' and c != '-' and w != c:
                self.mapping[chain_id][starting_aa + offset].add_mutation(c)
                offset += 1
            elif w == '-' and c != '-':
                self.mapping[chain_id][starting_aa + offset].add_insertion(c)
                offset += 1


    def map_seqres(self):

        for sr in self.seqres:
            self.map_to_wt_blast(sr.annotations['chain'], sequence=sr.seq, seqres=True)


    def get_report(self):

        for chain in sorted(self.mapping.keys()):
            print("Chain {}".format(chain))
            for res in sorted(self.mapping[chain].keys()):
                print(self.mapping[chain][res])

    def save_excel_report(self, file_name):
        
        workbook = xlsxwriter.Workbook(file_name)
        
        for chain in sorted(self.mapping.keys()):
            worksheet = workbook.add_worksheet(chain)
            worksheet.write_row(0,0,["Protein number", "Residue name", "PDB number", "Generic number", "Mutation", "SEQRES"])

            row_id = 1
            for res in sorted(self.mapping[chain].keys()):
                tmp = self.mapping[chain][res]
                worksheet.write_row(row_id, 0, tmp.get_param_list())
                row_id += 1
        workbook.close()


class SequenceParserPW(object):
    """
    Class mapping the pdb, pdb_seqres, wildtype and any given sequence onto wt. It produces a report with missing, mutated and inserted residues.
    """

    residue_list = ["ARG","ASP","GLU","HIS","ASN","GLN","LYS","SER","THR","HID","PHE","LEU","ILE","TYR","TRP","VAL","MET","PRO","CYS","ALA","GLY"]

    def __init__(self, pdb_file, sequence=None):

        # dictionary of 'ParsedResidue' object storing information about alignments and bw numbers
        self.mapping = {}
        
        # a list of SeqRecord objects retrived from the pdb SEQRES section
        self.seqres = list(SeqIO.parse(pdb_file, 'pdb-seqres'))

        self.pdb_struct = PDBParser(QUIET=True).get_structure('pdb', pdb_file)[0]

        # SeqRecord id is a pdb_code:chain 
        self.struct_id = self.seqres[0].id.split(':')[0]
        self.wt = Structure.objects.get(pdb_code__index=self.struct_id).protein_conformation.protein.parent
        self.wt_seq = str(self.wt.sequence)
        self.wt_seq_start = Residue.objects.filter(protein_conformation__protein=self.wt.id).order_by("sequence_number")[0].sequence_number
        print(self.wt_seq_start)
        # a dictionary of per chain lists of peptides found in the pdb
        self.pdb_seq = {}
        for chain in self.pdb_struct:
            self.pdb_seq[chain.id] = self.get_res_list(chain)
            self.mapping[chain.id] = {}

            self.map_wildtype(chain=chain)

    def get_res_list(self, chain):

        #Both Polypeptide and and SeqIO suck at retrieving full aminoacid sequence. Have to do it the hard way.
        return [x  for x in chain if x.resname in self.residue_list]


    def get_chain_sequence(self, chain):
        return "".join([polypeptide.three_to_one(x.resname.replace('HID', 'HIS')) for x in chain if x.resname in self.residue_list])


    def align_to_wt(self, sequence):
        """
        Get the pairwise alignment between wildtype and a given sequence.
        """
        return pairwise2.align.localms(self.wt_seq, sequence, 2, -4, -4, -.1, one_alignment_only=True)[0]


    def map_wildtype(self, chain=None, seqres=None, sequence=None):

        if chain:
            query = self.get_chain_sequence(chain)
        elif seqres:
            query = seqres
        else:
            query = sequence

        wt, chain_seq, score, start, end = self.align_to_wt(query)
        print(wt)
        print(chain_seq)
        offset = 0
        for w, c in zip(wt, chain_seq):
            #if offset+self.wt_seq_start not in self.mapping[chain.id].keys() and w != '-':
            #    self.mapping[chain.id][offset+self.wt_seq_start] = ParsedResidue(w, offset+self.wt_seq_start)
            if w == c:
                if seqres:
                    self.mapping[chain.id][offset+self.wt_seq_start].seqres=True
                r = Residue.objects.get(sequence_number=offset+self.wt_seq_start, protein_conformation__protein=self.wt.id)
                if r.display_generic_number is not None:
                    self.mapping[chain.id][offset+self.wt_seq_start].add_gpcrdb(r.display_generic_number)
                offset += 1
            elif c == '-' and w != '-':
                print(offset+self.wt_seq_start)
                self.mapping[chain.id][offset+self.wt_seq_start].add_deletion()
                offset += 1
            elif w != '-' and c != '-' and w != c:
                self.mapping[chain.id][offset+self.wt_seq_start].add_mutation(c)
                offset += 1

