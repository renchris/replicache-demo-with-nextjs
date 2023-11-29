'use server'

const ListPage = ({ params }: { params: { listID: string } }) => {
  // Access the dynamic route parameter 'listID'
  const { listID } = params

  // Now you can use 'listID' in your component
  return (
    <div>
      List ID:
      {' '}
      {listID}
    </div>
  )
}

export default ListPage
