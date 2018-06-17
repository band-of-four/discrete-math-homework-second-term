from collections import defaultdict
import numpy as np


def intersection_graph(ham_graph):
    arr_map = defaultdict(list)
    set_values = set()
    for i in range(0, len(ham_graph)):
        for j in range(i + 2, len(ham_graph[i])):
            if ham_graph[i][j] == 1:
                print('Определим p' + str(i + 1) + str(j + 1))
                print('Ребро x' + str(i + 1) + 'x' + str(j + 1) + ' пересекает', end=' ')
                for i1 in range(0, i):
                    for j1 in range(i + 1, j):
                        if ham_graph[i1][j1] == 1:
                            arr_map[(i, j)].append((i1, j1))
                            set_values.add((i, j))
                            set_values.add((i1, j1))
                            print('x' + str(i1 + 1) + 'x' + str(j1 + 1), end=' ')
                print('\n')
    list_values = list(set_values)
    matrix = dict_to_matrix(arr_map, list_values)
    #build_psy_family(matrix, list_values)

    matrix1 = [
        [1, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 0, 1, 1],
        [1, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 1, 1],
        [0, 0, 1, 0, 0, 1, 1, 0],
        [0, 1, 0, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 1]
    ]
    loop(matrix1)
    return arr_map


def dict_to_matrix(arr_map, list_values):
    print(list_values)
    print('Вершины графа пересечений')
    result = [[0 for x in range(len(list_values))] for y in range(len(list_values))]
    for i in range(0, len(list_values)):
        result[i][i] = 1
        for k in range(0, len(arr_map[list_values[i]])):
            for l in range(0, len(list_values)):
                if list_values[l] == arr_map[list_values[i]][k]:
                    result[i][l] = 1
                    result[l][i] = 1


    print()
    print(result)
    print('матрица смежности графа перечечний')
    return result


def to_string(matrix_str):
    s1 = ''
    for j in range(0, len(matrix_str)):
        s1 += str(matrix_str[j])
    return s1


def build_psy_family(matrix, list_values):
    for i in range(0, len(matrix)):
        args = []
        args.append(i)
        check(to_string(matrix[i]), args, matrix)


def check(s, args, matrix):
    s = bin(int(s, 2))[2:].zfill(len(matrix))
    if s == '1'*len(s):
        print(args)
        return args
    if len(args) == len(matrix):
        print('none')
        return None
    for i in range(0, len(matrix)):
        if s[i] == '0':
            args.append(i)
            dis = int(s, 2) | int(to_string(matrix[i]), 2)

            check(str(bin(dis)[2:]), args, matrix)
            del args[-1]


def loop(matrix):
    result = []
    for i in range(len(matrix)):
        J = [j for (j, el) in enumerate(matrix[i]) if el == 0 and j > i]
        print(f'J = {J}')
        if len(J) == 0:
            print('psi = {' + str(i) + '}')
            result.append([i])
        else:
            recurse_j_prime(matrix, J, i, matrix[i], [i], result)
    print(result)
    return result

def recurse_j_prime(M, J_prime, j, disj, psy, result):
    if np.all(disj):
        result.append(psy)
        print(f'psy = {psy}, result = {result}')
        return result
    for k in J_prime:
        if k <= j: continue
        psy.append(k)
        print(f'M{psy}  = {disj} or {M[k]} = {orr(disj, M[k])}')
        curr_disj = orr(disj, M[k])
        J_prime = [j for (j, el) in enumerate(curr_disj) if el == 0]
        recurse_j_prime(M, J_prime, k, curr_disj, psy, result)
        psy.remove(k)
    return result

            # iter = 0
            # J_prime = np.array(J)
            # zeroes = lambda d, j: list(filter(lambda ind: ind >= j, np.where(d == 0)[0]))
            # while len(J_prime) != 0:
            #     iter += 1
            #     if iter == 3: return
            #     psy = [i, J[0]]
            #     d = orr(matrix[i], matrix[J_prime[0]])
            #     zs = list(filter(lambda k: k > J_prime[0], np.where(d == 0)[0]))
            #     if len(zs) != 0:
            #         J_prime = np.delete(J_prime, np.where(J_prime == zs[0] - 1))
            #     print(f'd: {d}, J: {J}, new J: {J_prime}')
            #     for j in J_prime:
            #         k = J_prime[-1]
            #         zs = zeroes(d, j)
            #         if len(zs) != 0:
            #             k = zs[0]
            #         # print(f'j = {j}, k = {k}')
            #         psy.append(k)
            #         print(f'M{psy}  = {d} or {matrix[k]} = ', end = ' ')
            #         d = orr(d, matrix[k])
            #         print(d)
            #         if np.all(d):
            #             print('psy = ' + str(psy))
            #             result.append(psy)
            #             break


    print(result)
    return result

def orr(x1, x2):
    return np.logical_or(x1, x2).astype(int)


ham_graph1 = [
    [0, -1, 1, 0, 0, 0, -1],
    [-1, 0, -1, 1, 0, 1, 0],
    [-1, -1, 0, -1, 1, 1, 1],
    [-1, -1, -1, 0, -1, 0, 1],
    [-1, -1, -1, -1, 0, -1, 1],
    [-1, -1, -1, -1, -1, 0, -1],
    [-1, -1, -1, -1, -1, -1, 0]
]
intersection_graph(ham_graph1)
