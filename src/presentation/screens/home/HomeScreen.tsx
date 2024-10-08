import {FlatList, StyleSheet, View} from 'react-native';
import {FAB, Text, useTheme} from 'react-native-paper';
import {getPokemons} from '../../../actions/pokemons';
import {
  useInfiniteQuery,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import {PokeballBg} from '../../components/ui/PokeballBg';
import {Pokemon} from '../../../domain/entities/pokemon';
import {globalTheme} from '../../../config/theme/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PokemonCard} from '../../components/pokemons/PokemonCard';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParams} from '../../navigator/StackNavigator';

interface Props extends StackScreenProps<RootStackParams, 'HomeScreen'> {}

export const HomeScreen = ({navigation}: Props) => {
  const {top} = useSafeAreaInsets();

  const theme = useTheme();

  const queryClient = useQueryClient();

  /*
  // Forma tradicional de una petición http
  const {isLoading, data: pokemons = []} = useQuery({
    queryKey: ['pokemons'],
    queryFn: () => getPokemons(0, 20),
    staleTime: 1000 * 60 * 60, // 60 minutos
  });
  */

  const {isLoading, data, fetchNextPage} = useInfiniteQuery({
    queryKey: ['pokemons', 'infinite'],
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60, // 60 minutos
    queryFn: async params => {
      const pokemons = await getPokemons(params.pageParam);

      pokemons.forEach(pokemon => {
        queryClient.setQueryData(['pokemons', pokemon.id], pokemon);
      });

      return pokemons;
    },
    getNextPageParam: (lastPage, pages) => pages.length,
  });

  return (
    <View style={globalTheme.globalMargin}>
      <PokeballBg style={styles.imgPosition} />
      <FlatList
        data={data?.pages.flat() ?? []}
        keyExtractor={(pokemon: Pokemon, index) => `${pokemon.id}-${index}`}
        numColumns={2}
        style={{paddingTop: top + 20}}
        ListHeaderComponent={() => <Text variant="displayMedium">Pokedex</Text>}
        renderItem={({item: pokemon}) => <PokemonCard pokemon={pokemon} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => fetchNextPage()}
        showsHorizontalScrollIndicator={false}
      />
      <FAB
        label="buscar"
        style={[globalTheme.fab, {backgroundColor: theme.colors.primary}]}
        mode="elevated"
        color={theme.dark ? 'black' : 'white'}
        onPress={() => navigation.push('SearchScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imgPosition: {
    position: 'absolute',
    top: -100,
  },
});
